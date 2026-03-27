import colorsys
import random

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import (
    Bank,
    BankAccount,
    DinoHolder,
    Expenditure,
    ExpenditureCategory,
    ExpenditurePurpose,
    Income,
    IncomePurpose,
    InvoiceColumnMap,
    Transaction,
)


class DinoHolderAdmin(UserAdmin):
    list_display = (
        "nick_name",
        "first_name",
        "last_name",
        "email_link",
        "job_title",
        "profile_picture",
    )

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            _("Personal info"),
            {
                "fields": (
                    "nick_name",
                    "first_name",
                    "last_name",
                    "email",
                    "profile_picture",
                    "job_title",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            None,
            {
                "fields": (
                    "nick_name",
                    "profile_picture",
                    "job_title",
                )
            },
        ),
    )

    def email_link(self, obj):
        url = reverse(
            "admin:%s_%s_change" % (obj._meta.app_label, obj._meta.model_name),
            args=[obj.pk],
        )
        return format_html('<a href="{}">{}</a>', url, obj.email)

    email_link.short_description = "Email Address"


admin.site.register(DinoHolder, DinoHolderAdmin)


class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "first_account_user_username",
        "amount",
        "balance",
        "currency",
        "booking_date",
        "payment_type",
    )

    def first_account_user_username(self, obj):
        first_user = obj.account.user.first()
        if first_user:
            return first_user.username
        return "-"

    list_filter = (
        "account__iban",
        "payment_type",
    )
    search_fields = ("account__iban", "description")
    ordering = ("-booking_date",)

    @admin.action(description="Delete all entries")
    def remove_all_transactions(modeladmin, request, queryset):
        """Remove Transaction entries"""
        # Get all banks
        Transaction.objects.all().delete()
        modeladmin.message_user(
            request, "Deleted all transaction entries", level="info"
        )

    actions = [remove_all_transactions]


admin.site.register(Transaction, TransactionAdmin)


class IncomePurposeAdmin(admin.ModelAdmin):
    list_display = ("name", "pattern")
    search_fields = ("name",)
    ordering = ("name",)


admin.site.register(IncomePurpose, IncomePurposeAdmin)


class IncomeAdmin(admin.ModelAdmin):
    list_display = (
        "transaction__amount",
        "source",
        "purpose__name",
        "transaction__booking_date",
    )
    list_filter = ("source", "purpose__name")
    search_fields = ("source", "transaction__amount")
    ordering = ("-transaction__booking_date",)


admin.site.register(Income, IncomeAdmin)


class ExpenditureCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    ordering = ("name",)


admin.site.register(ExpenditureCategory, ExpenditureCategoryAdmin)


def generate_distinct_colors(n):
    colors = []
    for i in range(n):
        hue = i / n
        lightness = 0.5
        saturation = 0.8
        r, g, b = colorsys.hls_to_rgb(hue, lightness, saturation)
        colors.append(
            "#{:02x}{:02x}{:02x}".format(int(r * 255), int(g * 255), int(b * 255))
        )
    return colors


@admin.action(description="Assign unique color to every purpose")
def assign_unique_colors(modeladmin, request, queryset):
    items = ExpenditurePurpose.objects.all().order_by("id")
    n = items.count()
    colors = generate_distinct_colors(n)

    for i, obj in enumerate(items):
        obj.color = colors[i]
        obj.save()

    modeladmin.message_user(request, f"successfully assigned {n} colors")


@admin.action(description="Reset colors to default value")
def reset_colors(modeladmin, request, queryset):

    items = ExpenditurePurpose.objects.all().order_by("id")
    n = items.count()
    colors = ["#000" for i in range(n)]

    for i, obj in enumerate(items):
        obj.color = colors[i]
        obj.save()
    modeladmin.message_user(request, f"successfully reset {n} colors")


class ExpenditurePurposeAdmin(admin.ModelAdmin):
    list_display = ("name", "category__name")
    search_fields = ("name", "category__name")
    ordering = ("name",)
    actions = [assign_unique_colors, reset_colors]


admin.site.register(ExpenditurePurpose, ExpenditurePurposeAdmin)


class ExpenditureAdmin(admin.ModelAdmin):
    list_display = (
        "transaction__amount",
        "purpose__name",
        "category_name",
        "transaction__booking_date",
    )

    def category_name(self, obj):
        return (
            obj.purpose.category.name if obj.purpose and obj.purpose.category else "-"
        )

    list_filter = ("purpose__category__name",)
    search_fields = ("purpose__name", "transaction__amount")
    ordering = ("-transaction__booking_date",)


admin.site.register(Expenditure, ExpenditureAdmin)


class BankAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "date_order",
        "preprocess_function_name",
    )

    search_fields = ("name",)
    list_filter = ("preprocess_function_name",)
    ordering = ("name",)

    @admin.action(description="Clean up unused banks")
    def remove_unused_banks(modeladmin, request, queryset):
        """Remove all Bank objects that are not used by any BankAccount or InvoiceColumnMap"""
        # Get all banks
        all_banks = Bank.objects.all()
        unused_banks = []

        for bank in all_banks:
            if (
                not bank.bank_acc_bank.exists()
                and not bank.bank_invoice_column_map.exists()
            ):
                unused_banks.append(bank)

        count = len(unused_banks)
        if count > 0:
            for bank in unused_banks:
                bank.delete()
            modeladmin.message_user(
                request,
                f"Successfully removed {count} unused bank(s) from entire database",
                level="success",
            )
        else:
            modeladmin.message_user(
                request, "No unused banks found in database", level="info"
            )

    actions = [remove_unused_banks]


admin.site.register(Bank, BankAdmin)


class InvoiceColumnMapAdmin(admin.ModelAdmin):
    list_display = (
        "iban",
        "amount",
        "balance",
        "currency",
        "booking_date",
        "payment_participant_name",
        "intention",
        "payment_type",
        "account_name",
        "bic",
        "bank_name",
        "bank",
    )

    search_fields = ("bank",)
    list_filter = ("bank",)
    ordering = ("bank",)


admin.site.register(InvoiceColumnMap, InvoiceColumnMapAdmin)


class BankAccountAdmin(admin.ModelAdmin):
    list_display = (
        "first_user_username",
        "account_name",
        "bank",
        "iban",
        "bic",
        "column_map",
    )

    def first_user_username(self, obj):
        first_user = obj.user.first()
        if first_user:
            return first_user.username
        return "-"

    search_fields = ("iban",)
    list_filter = ("bank",)
    ordering = ("iban",)


admin.site.register(BankAccount, BankAccountAdmin)
