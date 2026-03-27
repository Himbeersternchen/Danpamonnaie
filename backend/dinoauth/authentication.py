from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTFromCookieAuthentication(JWTAuthentication):
    def get_header(self, request):
        # Override: Have DRF's JWT verification read from the Authorization header (retained)
        # but prioritise reading the access_token from the cookie.
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return super().get_header(request)
        # JWTAuthentication expects b"Bearer <token>" style header bytes,
        # Therefore, we convert the cookie token into equivalent header bytes:
        return f"Bearer {raw_token}".encode()

    # Note: We don't override authenticate() - let the parent class handle it.
    # The parent class will call get_header(), then get_raw_token() to extract
    # the token from "Bearer xxx", then get_validated_token() to validate it.
