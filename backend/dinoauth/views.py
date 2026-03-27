from django.middleware import csrf
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


class DinoTokenObtainPairView(TokenObtainPairView):
    """
    POST -> returns 200 and sets HttpOnly cookies:
      - access_token (HttpOnly)
      - refresh_token (HttpOnly)
    Also sets a non-HttpOnly cookie 'csrf_token' for the frontend to read and send back in header X-CSRFToken (double-submit).
    """

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": "Invalid credentials"}, status=401)

        user = serializer.user
        data = serializer.validated_data
        access = data.get("access")
        refresh = data.get("refresh")
        # Set cookies
        cookie_params = {
            "httponly": True,
            "secure": True,  # True (HTTPS)
            "samesite": "Lax",  # or 'Strict'，depends on situation
            # 'domain': '.yourdomain.com', 'set if needed'
            # 'path': '/',                # default
        }
        out = Response(
            {
                "detail": "ok",
                "username": user.username,
                "nickname": user.nick_name,
                "email": user.email,
            }
        )
        out.set_cookie(
            "access_token", access, max_age=300, **cookie_params
        )  # 5 minutes
        out.set_cookie("refresh_token", refresh, max_age=7 * 24 * 3600, **cookie_params)

        # Set a readable CSRF token cookie for double-submit
        csrf_token = csrf.get_token(request)
        # readable cookie in frontend（not HttpOnly），used to be send in X-CSRFToken header of leter request
        out.set_cookie("csrf_token", csrf_token, secure=True, samesite="Lax")

        return out


class DinoTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Expect refresh token in cookie
        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return Response(
                {"detail": "no refresh cookie"}, status=status.HTTP_401_UNAUTHORIZED
            )
        request.data["refresh"] = refresh
        response = super().post(
            request, *args, **kwargs
        )  # returns new access (and possibly refresh)
        if response.status_code != 200:
            return response

        data = response.data
        access = data.get("access")
        new_refresh = data.get("refresh")  # if ROTATE_REFRESH_TOKENS is true
        cookie_params = {"httponly": True, "secure": True, "samesite": "Lax"}

        out = Response({"detail": "refreshed"})
        out.set_cookie("access_token", access, max_age=300, **cookie_params)
        if new_refresh:
            out.set_cookie(
                "refresh_token", new_refresh, max_age=7 * 24 * 3600, **cookie_params
            )
        return out


@api_view(["POST"])
def cookie_logout(request):
    # delete cookie

    refresh_token = request.COOKIES.get("refresh_token")
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # Token is invalid or expired, ignore it

    out = Response({"detail": "logged out"})
    out.delete_cookie("access_token")
    out.delete_cookie("refresh_token")
    out.delete_cookie("csrf_token")
    return out


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response(
        {
            "nickname": user.nick_name,
            "username": user.username,
            "email": user.email,
        }
    )
