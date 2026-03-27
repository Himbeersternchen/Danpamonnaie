from dinoapi.views import (
    BalanceWaterfallView,
    CSVUploadView,
    ExpenditureBarView,
    ExpenditureBoxView,
    ExpenditureBubbleView,
    ExpenditureHistogramView,
    ExpenditureLineView,
    ExpenditurePieView,
    ExpenditureSankeyView,
    ExpenditureView,
    ValidDateRangeView,
    get_user_bank_acc,
    operate_bank_acc,
)
from dinoauth.views import (
    DinoTokenObtainPairView,
    DinoTokenRefreshView,
    cookie_logout,
    profile,
)
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"expenditure", ExpenditureView, "expenditure")


api_name = "dinoapi/"
auth_name = "dinoauth/"


def get_dinoapi_url(part_url):
    return api_name + part_url


def get_dinoauth_url(part_url):
    return auth_name + part_url


urlpatterns = [
    # dinoapi
    path("admin/", admin.site.urls),
    path(api_name, include(router.urls)),
    path("api-auth/", include("rest_framework.urls")),
    path(
        get_dinoapi_url("expenditure_sankey/"),
        ExpenditureSankeyView.as_view(),
        name="expenditure-sankey",
    ),
    path(
        get_dinoapi_url("expenditure_pie/"),
        ExpenditurePieView.as_view(),
        name="expenditure-pie",
    ),
    path(
        get_dinoapi_url("expenditure_bar/"),
        ExpenditureBarView.as_view(),
        name="expenditure-bar",
    ),
    path(
        get_dinoapi_url("expenditure_line/"),
        ExpenditureLineView.as_view(),
        name="expenditure-line",
    ),
    path(
        get_dinoapi_url("balance_waterfall/"),
        BalanceWaterfallView.as_view(),
        name="balance-waterfall",
    ),
    path(
        get_dinoapi_url("expenditure_histogram/"),
        ExpenditureHistogramView.as_view(),
        name="expenditure-histogram",
    ),
    path(
        get_dinoapi_url("expenditure_box/"),
        ExpenditureBoxView.as_view(),
        name="expenditure-box",
    ),
    path(
        get_dinoapi_url("expenditure_bubble/"),
        ExpenditureBubbleView.as_view(),
        name="expenditure-bubble",
    ),
    path(
        get_dinoapi_url("valid_date_range/"),
        ValidDateRangeView.as_view(),
        name="valid-date-range",
    ),
    path(get_dinoapi_url("upload_csv/"), CSVUploadView.as_view(), name="upload-csv"),
    # dinoauth
    path(
        get_dinoauth_url("token/"),
        DinoTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        get_dinoauth_url("token/refresh/"),
        DinoTokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(get_dinoauth_url("logout/"), cookie_logout),
    path(get_dinoauth_url("profile/"), profile),
    path(get_dinoapi_url("operate_bank_acc/"), operate_bank_acc),
    path(get_dinoapi_url("get_user_bank_acc/"), get_user_bank_acc),
]
