# Create your views here.
import calendar
import json
from collections import defaultdict
from decimal import Decimal

from dinoapi.models import BankAccount, Transaction
from dinoapi.serializers import (
    BankAccountSerializer,
    BarWeeklySummarySerializer,
    BoxWeeklySummarySerializer,
    CSVUploadSerializer,
    DatesSummarySerializer,
    ExpenditureSerializer,
    FourDimensionDataSerializer,
    HistogramExpenditureSerializer,
    ProcessBankAccSerializer,
    ValidateDateRangeSerializer,
    WaterfallBalanceSerializer,
)
from dinoapi.utils import (
    dino_expenditure_query_preprocess,
    dino_transaction_filter_user,
    dino_transaction_query_preprocess,
    get_dino_transaction_start_balance,
    get_empty_error_response,
)
from django.contrib.postgres.aggregates import ArrayAgg
from django.db import transaction
from django.db.models import Count, F, Max, Min, Sum
from django.db.models.functions import (
    Abs,
    ExtractIsoYear,
    ExtractMonth,
    ExtractWeek,
    ExtractWeekDay,
)
from numpy import median
from parse_invoice_letter.match_transaction_purpose import MatchTransactionPurpose
from parse_invoice_letter.process_bank import ProcessBank
from parse_invoice_letter.process_column_map import ProcessColumnMap
from parse_invoice_letter.read_invoice_csv import ReadInvoice
from parse_invoice_letter.utils.transform_dict import invert_dict
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@permission_classes([IsAuthenticated])
class ExpenditureView(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExpenditureSerializer

    def get_queryset(self):
        queryset = dino_expenditure_query_preprocess(
            self.request, pre_fields=("purpose__category",)
        )
        return queryset


@permission_classes([IsAuthenticated])
class ExpenditureSankeyView(APIView):

    def get(self, request):
        queryset = dino_expenditure_query_preprocess(
            request, pre_fields=("purpose__category",)
        )

        if len(queryset) == 0:
            return get_empty_error_response("sankey")

        root_id = "total"
        other_purpose_id = "other_purpose"
        other_category_id = "other_category"
        res_nodes_map = {
            root_id: {
                "id": root_id,
                "label": root_id,
                "idx": 0,
                "source_data": {},
            },
        }
        res_nodes = []
        res_links = []

        for trans in queryset:

            transaction_amount = float(trans.transaction.amount)

            # check if payment type is already registered
            if trans.transaction.payment_type not in res_nodes_map:
                res_nodes_map[trans.transaction.payment_type] = {
                    "id": trans.transaction.payment_type,
                    "label": trans.transaction.payment_type,
                    "idx": len(res_nodes_map),
                    "source_data": {root_id: transaction_amount},
                }
            else:
                res_nodes_map[trans.transaction.payment_type]["source_data"][
                    root_id
                ] += transaction_amount

            # check if transaction purpose is already registered
            if trans.purpose is None:
                self.__update_res_inplace(
                    res_nodes_map,
                    trans.transaction.payment_type,
                    other_purpose_id,
                    transaction_amount,
                )

            else:
                self.__update_res_inplace(
                    res_nodes_map,
                    trans.transaction.payment_type,
                    trans.purpose.name,
                    transaction_amount,
                )
                # check if transaction category is already registered
                if trans.purpose.category is None:
                    self.__update_res_inplace(
                        res_nodes_map,
                        trans.purpose.name,
                        other_category_id,
                        transaction_amount,
                    )
                else:
                    self.__update_res_inplace(
                        res_nodes_map,
                        trans.purpose.name,
                        trans.purpose.category.name,
                        transaction_amount,
                    )

        print(
            json.dumps(
                sorted(res_nodes_map.values(), key=lambda x: x["idx"]),
                sort_keys=True,
                indent=4,
                separators=(",", ": "),
                ensure_ascii=False,
            )
        )

        for node in res_nodes_map.values():
            res_nodes.append({"label": node["label"]})
            for source, value in node["source_data"].items():
                res_links.append(
                    {
                        "source": res_nodes_map[source]["idx"],
                        "target": node["idx"],
                        "value": "{:.2f}".format(abs(value)),
                    }
                )

        res = {"nodes": res_nodes, "links": res_links}

        return Response(res)

    @staticmethod
    def __update_res_inplace(res_nodes_map, source_name, target_name, data):
        if target_name not in res_nodes_map:
            res_nodes_map[target_name] = {
                "id": target_name,
                "label": target_name,
                "idx": len(res_nodes_map),
                "source_data": {source_name: data},
            }
        else:
            if source_name in res_nodes_map[target_name]["source_data"]:
                res_nodes_map[target_name]["source_data"][source_name] += data
            else:
                res_nodes_map[target_name]["source_data"][source_name] = data


@permission_classes([IsAuthenticated])
class ExpenditurePieView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(
            request, pre_fields=("purpose__category",)
        )

        if len(queryset) == 0:
            return get_empty_error_response("pie")

        category_summaries = (
            queryset.values("purpose__category__name")
            .annotate(total_amount=Sum(Abs("transaction__amount")))
            .order_by("purpose__category__name")
        )

        res = {"values": [], "labels": [], "type": "pie"}
        for sum in category_summaries:
            res["values"].append(sum["total_amount"])
            res["labels"].append(sum["purpose__category__name"])

        return Response(res)


@permission_classes([IsAuthenticated])
class ExpenditureBarView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(request)

        if len(queryset) == 0:
            return get_empty_error_response("bar")

        grouped = (
            queryset.order_by()  # clear the existed order_by
            .annotate(weekday=ExtractWeekDay(F("transaction__booking_date")))
            .values("weekday")
            .annotate(total_amount=Sum(Abs("transaction__amount")))
        )

        data_map = {row["weekday"]: row["total_amount"] for row in grouped}

        # complete data for every weekday even no weekday data exists in database
        weekdays_list = []
        amounts_list = []
        for i in range(1, 8):  # ExtractWeekDay: 1=Sunday, 2=Monday, ..., 7=Saturday
            total = data_map.get(i, Decimal("0.00"))
            weekdays_list.append(calendar.day_name[(i - 2)])
            amounts_list.append(total)

        results = {"x": weekdays_list, "y": amounts_list}

        serializer = BarWeeklySummarySerializer(results)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class ExpenditureLineView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(request)

        if len(queryset) == 0:
            return get_empty_error_response("line")

        grouped = (
            queryset.values("transaction__booking_date")
            .annotate(total_amount=Sum("transaction__amount"))
            .order_by("transaction__booking_date")
        )

        dates_list = []
        amounts_list = []
        for row in grouped:
            dates_list.append(row["transaction__booking_date"])
            amounts_list.append(row["total_amount"])

        mean_value = sum(amounts_list) / len(amounts_list) if amounts_list else 1
        results = [
            {"x": dates_list, "y": amounts_list},
            {
                "x": [dates_list[0], dates_list[-1]],
                "y": [mean_value, mean_value],
            },
        ]
        serializer = DatesSummarySerializer(results, many=True)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class BalanceWaterfallView(APIView):
    def get(self, request):
        queryset = dino_transaction_query_preprocess(request)

        if len(queryset) == 0:
            return get_empty_error_response("waterfall")

        # the balance directly from query is the balance after booking
        start_balance = get_dino_transaction_start_balance(request)

        grouped = (
            queryset.annotate(month=ExtractMonth(F("booking_date")))
            .values("month")
            .annotate(total_amount=Sum("amount"))
            .order_by("month")
        )

        months_list = ["Start"]
        amount_list = [start_balance]
        text = [f"{start_balance}€"]

        for row in grouped:
            # ExtractMonth: 1=January, 2=February, ...
            months_list.append(calendar.month_name[row["month"]])
            amount_list.append(row["total_amount"])
            text.append(f'{row["total_amount"]}€')

        months_list.append("End")
        amount_list.append(0)
        text.append(f"{sum(Decimal(str(x)) for x in amount_list)}€")

        results = {"x": months_list, "y": amount_list, "text": text}
        serializer = WaterfallBalanceSerializer(results)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class ExpenditureHistogramView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(request)

        if len(queryset) == 0:
            return get_empty_error_response("histogram")

        x = queryset.annotate(
            expenditure_amount=Abs("transaction__amount")
        ).values_list("expenditure_amount", flat=True)

        results = {"x": x}
        # serializer can also handle QuerySet from Django ORM
        serializer = HistogramExpenditureSerializer(results)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class ExpenditureBoxView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(request)

        if len(queryset) == 0:
            return get_empty_error_response("box")

        grouped = (
            queryset.annotate(
                year=ExtractIsoYear("transaction__booking_date"),
                week=ExtractWeek("transaction__booking_date"),
                weekday=ExtractWeekDay("transaction__booking_date"),
            )
            .values("year", "week", "weekday")
            .annotate(count=Count("id"))
            .order_by("year", "week")
        )

        result = defaultdict(list)
        x = []
        y = []

        for i in range(
            0, 7
        ):  # weekday of ExtractWeekDay has number of 0-6 to sunday-saturday
            weekday_name = calendar.day_name[i]
            result[weekday_name] = []

        for row in grouped:
            weekday_num = row["weekday"]
            weekday_name = calendar.day_name[weekday_num - 2]
            result[weekday_name].append(row["count"])

        for key, values in result.items():
            if not values:
                x.append(key)
                y.append(0)
            else:
                for value in values:
                    x.append(key)
                    y.append(value)

        results = {"x": x, "y": y}

        serializer = BoxWeeklySummarySerializer(results)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class ExpenditureBubbleView(APIView):
    def get(self, request):
        queryset = dino_expenditure_query_preprocess(request, pre_fields=("purpose",))

        if len(queryset) == 0:
            return get_empty_error_response("bubble")

        grouped = (
            queryset.values("purpose__name")
            .annotate(
                totoal_amount=Sum(Abs("transaction__amount")),
                frequency=Count("transaction"),
                amounts=ArrayAgg(Abs("transaction__amount")),
                color=F("purpose__color"),
            )
            .order_by("-frequency")
        )

        result = {"x": [], "y": [], "size": [], "text": [], "color": []}

        for row in grouped:
            median_value = median(row["amounts"])
            result["x"].append(row["totoal_amount"])
            result["y"].append(median_value)
            result["size"].append(row["frequency"])
            result["text"].append(
                f'Amount: {row["totoal_amount"]}€<br>'
                + f"Median: {median_value}€<br>"
                + f'Frequency: {row["frequency"]} transactions<br>'
                + f"Category: {row["purpose__name"]}"
            )
            result["color"].append(row["color"])

        serializer = FourDimensionDataSerializer(result)

        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class ValidDateRangeView(APIView):
    def get(self, request):
        queryset = Transaction.objects.all()
        queryset = dino_transaction_filter_user(queryset, request)

        result = queryset.aggregate(
            min_date=Min("booking_date"), max_date=Max("booking_date")
        )

        serializer = ValidateDateRangeSerializer(result)
        return Response(serializer.data)


@permission_classes([IsAuthenticated])
class CSVUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = (
        CSVUploadSerializer  # create file upload button to DRF browsable API
    )

    def post(self, request):
        serializer = CSVUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        nickname = request.user.nick_name
        bank_name = serializer.validated_data.get("bank_name")
        if not nickname or not bank_name:
            return Response(
                {"error": "nickname and bank_name are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        csv_files = serializer.validated_data.get("files")
        row_count = 0
        try:
            with transaction.atomic():
                for csv_file in csv_files:
                    if not csv_file:
                        raise ValueError("No CSV file provided")
                    if not csv_file.name.endswith(".csv"):
                        raise ValueError("Uploaded file is not a CSV")
                    column_map = ProcessColumnMap.get_column_map_by_bank(bank_name)

                    invoice_reader = ReadInvoice(
                        {
                            "FILE": csv_file,
                            "USER_NICKNAME": nickname,
                            "COLUMN_MAP": column_map,
                            "BANK_NAME": bank_name,
                        }
                    )
                    # Fill up Transaction with csv data
                    invoice_reader.process_all()
                    row_count += len(invoice_reader.raw_data)

            # Match purpose to all transactions
            match_transaction_purpose = MatchTransactionPurpose()
            match_transaction_purpose.process_match()

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "CSV uploaded, and purpose matched successfully",
                "row_count": row_count,
            },
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def operate_bank_acc(request):
    serializer = ProcessBankAccSerializer(data=request.data, many=True)
    user = request.user

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    process_bank = ProcessBank(user.nick_name)

    try:
        process_bank.init_bank_acc_data(validated_data)
        return Response(
            {
                "message": "operate bank acc data successfully",
                "row_count": len(validated_data),
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_bank_acc(request):
    user = request.user
    try:
        user_bank_accouts = BankAccount.objects.filter(user=user)
        serializer = BankAccountSerializer(user_bank_accouts, many=True)
        return Response(serializer.data)
    except BankAccount.DoesNotExist:
        return Response(
            {"error": "You don't have any bank account yet"},
            status=status.HTTP_404_NOT_FOUND,
        )


@permission_classes([IsAuthenticated])
class TestView(APIView):
    def get(self, request):
        return Response({"message": "It works!"})
