from ast import Tuple
from datetime import datetime, timedelta

from dinoapi.models import BankAccount, Expenditure, Transaction
from rest_framework import status
from rest_framework.response import Response


def dino_expenditure_query_preprocess(
    request,
    pre_fields: Tuple = (),
):

    post_fields = ("transaction",) + pre_fields
    queryset = Expenditure.objects.select_related(*post_fields).all()

    start = request.query_params.get("start")
    end = request.query_params.get("end")
    user = request.user.username
    acc_id = request.query_params.get("acc_id")
    queryset = queryset.filter(transaction__account__user__username=user)
    queryset = queryset.filter(transaction__account__acc_id=acc_id)
    queryset = queryset.filter(transaction__booking_date__gte=start)
    queryset = queryset.filter(transaction__booking_date__lte=end)
    queryset = queryset.order_by("transaction__booking_date")

    return queryset


def dino_transaction_query_preprocess(
    request,
):

    queryset = Transaction.objects.all()

    start = request.query_params.get("start")
    end = request.query_params.get("end")
    queryset = dino_transaction_filter_user(queryset, request)
    queryset = queryset.filter(booking_date__gte=start)
    queryset = queryset.filter(booking_date__lte=end)
    queryset = queryset.order_by("booking_date")

    return queryset


# Convert string with validation
def to_number(s, num_type=float, default=None):
    try:
        return num_type(s)
    except (ValueError, TypeError):
        return default


def get_dino_transaction_start_balance(
    request,
):
    queryset = Transaction.objects.all()
    start = request.query_params.get("start")
    queryset = dino_transaction_filter_user(queryset, request)
    first_booking_date = vars(
        queryset.filter(booking_date__gte=start).order_by("booking_date").first()
    )["booking_date"]
    first_booking_date_transaction = queryset.filter(booking_date=first_booking_date)

    # The balances as key and the key occured frequecy as value
    balance_after = {}
    balance_before = {}
    # This is the algorithm to find out which blance is the first balance of all transactions at one day
    for row in first_booking_date_transaction.values():
        balance_after_transaction = row["balance"]
        amount = row["amount"]
        balance_before_transaction = balance_after_transaction - amount
        balance_after[balance_after_transaction] = (
            1
            if balance_after.get(balance_after_transaction) is None
            else balance_after[balance_after_transaction] + 1
        )
        balance_before[balance_before_transaction] = (
            1
            if balance_before.get(balance_before_transaction) is None
            else balance_before[balance_before_transaction] + 1
        )

    for key in balance_after:
        if balance_before.get(key) is not None:
            balance_before[key] = balance_before[key] - 1

    # Get the key of balance_before which has the biggest value
    start_balance = max(balance_before, key=balance_before.get)

    start_balance_frequency = balance_before[start_balance]
    start_balances = [
        k for k, v in balance_before.items() if v == start_balance_frequency
    ]
    if len(start_balances) < 2:
        return to_number(start_balance)
    else:
        user_bank_date_order = get_bank_data_date_order_by_user(request)
        # If transactions compensates with each other, there is no robust way to get the start_balance,
        # so we can only trust the order of raw data which was saved into database
        return (
            to_number(start_balances[0])
            if user_bank_date_order > 0
            else to_number(start_balances[-1])
        )


def dino_transaction_filter_user(queryset, request):
    user = user = request.user.username
    acc_id = request.query_params.get("acc_id")
    return queryset.filter(account__user__username=user).filter(account__acc_id=acc_id)


def get_bank_data_date_order_by_user(request):
    user = user = request.user.username
    acc_id = request.query_params.get("acc_id")
    res = (
        BankAccount.objects.filter(user__username=user)
        .filter(acc_id=acc_id)
        .values("bank__date_order")
        .first()
    )
    return res["bank__date_order"]


def get_empty_error_response(plot_name):
    return Response(
        {"error": f"No Data existed for {plot_name}"},
        status=status.HTTP_400_BAD_REQUEST,
    )
