import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_delete

DEFAULT_COLOR = "#000"


class DinoHolder(AbstractUser):
    nick_name = models.CharField(max_length=150, unique=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", blank=True, null=True
    )
    job_title = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.username


class Bank(models.Model):
    SIGN_CHOICES = [(1, "Ascending"), (-1, "Descending")]
    name = models.CharField(max_length=100, blank=True)
    date_order = models.IntegerField(choices=SIGN_CHOICES, default=-1)
    preprocess_function_name = models.CharField(max_length=100, default="default")

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(date_order__in=[1, -1]),
                name="date_order_must_be_1_or_minus_1",
            )
        ]

    def __str__(self):
        return f"{self.name}"


class InvoiceColumnMap(models.Model):
    iban = models.CharField(max_length=100, blank=False, default="iban")
    amount = models.CharField(max_length=100, blank=False, default="amount")
    balance = models.CharField(max_length=100, blank=False, default="balance")
    currency = models.CharField(max_length=100, blank=False, default="currency")
    booking_date = models.CharField(max_length=100, blank=False, default="booking_date")
    payment_participant_name = models.CharField(
        max_length=100, blank=False, default="payment_participant_name"
    )
    intention = models.CharField(max_length=100, blank=False, default="intention")
    payment_type = models.CharField(max_length=100, blank=False, default="payment_type")
    account_name = models.CharField(max_length=100, blank=False, default="account_name")
    bic = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=False, default="bank_name")
    bank = models.ForeignKey(
        Bank,
        on_delete=models.CASCADE,
        related_name="bank_invoice_column_map",
        null=True,
    )

    def __str__(self):
        return f"{self.bank}"


class BankAccount(models.Model):
    acc_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="bank_account_user"
    )
    account_name = models.CharField(max_length=100, blank=True)
    bank = models.ForeignKey(
        Bank,
        on_delete=models.SET_NULL,
        related_name="bank_acc_bank",
        null=True,
    )
    iban = models.CharField(max_length=34, unique=True)
    bic = models.CharField(max_length=11, blank=True)
    column_map = models.ForeignKey(
        InvoiceColumnMap,
        on_delete=models.SET_NULL,
        related_name="bank_acc_invoice_column_map",
        null=True,
    )

    def __str__(self):
        if self.user.first():
            return f"{self.user.first().username} - {self.account_name} - {self.iban}"
        else:
            return f"User Not Exist - {self.account_name} - {self.iban}"


class Transaction(models.Model):
    account = models.ForeignKey(
        BankAccount,
        on_delete=models.CASCADE,
        related_name="transaction_account",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, default=None
    )
    currency = models.CharField(max_length=3, default="EUR")
    booking_date = models.DateField(null=True, default=None)
    description = models.TextField(blank=True, default="")
    payment_type = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        ordering = ["-booking_date"]

    def __str__(self):
        username = (
            self.account.user.first().username
            if self.account.user.exists()
            else "Unknown User"
        )
        return f"{username} - {self.amount} - {self.booking_date}"


class IncomePurpose(models.Model):
    name = models.CharField(max_length=100, unique=True)
    pattern = models.TextField(blank=False, default="NoChance2Match^")

    def __str__(self):
        return self.name


class Income(models.Model):
    CATEGORY_CHOICES = [
        ("salary", "Salary"),
        ("gift", "Gift"),
        ("other", "Other"),
    ]

    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        limit_choices_to={"amount__gte": 0},
        related_name="income_transaction",
    )
    source = models.CharField(max_length=100, blank=True)
    purpose = models.ForeignKey(
        IncomePurpose,
        on_delete=models.SET_NULL,
        related_name="income_purpose",
        null=True,
    )

    class Meta:
        ordering = ["-transaction__booking_date"]

    def __str__(self):
        if self.transaction.account.user.exists():
            username = self.transaction.account.user.first().username
        else:
            username = "Unknown User"
        return f"{username} - {self.transaction.amount} - {self.source}"


class ExpenditureCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class ExpenditurePurpose(models.Model):
    name = models.CharField(max_length=100, unique=True)
    pattern = models.TextField(blank=False, default="NoChance2Match^")
    category = models.ForeignKey(
        ExpenditureCategory,
        on_delete=models.SET_NULL,
        related_name="expenditure_purpose_category",
        null=True,
        blank=True,
    )
    color = models.CharField(
        null=False, blank=False, default=DEFAULT_COLOR, max_length=100
    )

    def __str__(self):
        return self.name


class Expenditure(models.Model):
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        limit_choices_to={"amount__lt": 0},
        related_name="expenditure_transaction",
    )

    purpose = models.ForeignKey(
        ExpenditurePurpose,
        on_delete=models.SET_NULL,
        related_name="expenditure_purpose",
        null=True,
    )

    class Meta:
        ordering = ["-transaction__booking_date"]

    def __str__(self):
        if self.transaction.account.user.exists():
            username = self.transaction.account.user.first().username
        else:
            username = "Unknown User"
        return f"{username} - {self.transaction.amount}"
