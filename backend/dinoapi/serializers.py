from pydoc import text

from numpy import require
from rest_framework import serializers
from traitlets import default

from .models import (
    BankAccount,
    Expenditure,
    ExpenditureCategory,
    ExpenditurePurpose,
    Transaction,
)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ("id", "amount", "balance", "currency", "booking_date", "payment_type")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenditureCategory
        fields = ("id", "name")


class PurposeSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = ExpenditurePurpose
        fields = ("id", "name", "pattern", "category")


class ExpenditureSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer()
    purpose = PurposeSerializer()

    class Meta:
        model = Expenditure
        fields = ("id", "transaction", "purpose")


class BarWeeklySummarySerializer(serializers.Serializer):
    x = serializers.ListField(child=serializers.CharField())
    y = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    type = serializers.CharField(default="bar", read_only=True)


class DatesSummarySerializer(serializers.Serializer):
    x = serializers.ListField(child=serializers.CharField())
    y = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )


class WaterfallBalanceSerializer(serializers.Serializer):
    x = serializers.ListField(child=serializers.CharField())
    y = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    text = serializers.ListField(child=serializers.CharField())
    type = serializers.CharField(default="waterfall", read_only=True)


class HistogramExpenditureSerializer(serializers.Serializer):
    x = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    type = serializers.CharField(default="histogram", read_only=True)


class BoxWeeklySummarySerializer(serializers.Serializer):
    x = serializers.ListField(child=serializers.CharField())
    y = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    type = serializers.CharField(default="box", read_only=True)


class FourDimensionDataSerializer(serializers.Serializer):
    x = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    y = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    size = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    text = serializers.ListField(child=serializers.CharField())
    color = serializers.ListField(child=serializers.CharField())


class ValidateDateRangeSerializer(serializers.Serializer):
    min_date = serializers.DateField()
    max_date = serializers.DateField()


class CSVUploadSerializer(serializers.Serializer):
    files = serializers.ListField(child=serializers.FileField())
    bank_name = serializers.CharField()


class ProcessBankSerializer(serializers.Serializer):
    bank_name = serializers.CharField(max_length=200, required=True)


class ProcessBankAccSerializer(serializers.Serializer):
    iban = serializers.CharField(max_length=34, required=True)
    bank_name = serializers.CharField(max_length=200, required=True)
    account_name = serializers.CharField(max_length=200, required=False)
    bic = serializers.CharField(max_length=11, required=False)


class BankAccountSerializer(serializers.ModelSerializer):
    bank_name = serializers.CharField(source="bank.name", read_only=True)
    bank_address = serializers.CharField(source="bank.address", read_only=True)

    class Meta:
        model = BankAccount
        fields = ["account_name", "bank_name", "bank_address", "iban", "bic", "acc_id"]
