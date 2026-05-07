from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["full_name", "email", "mobile", "password"]

    # 🔥 EMAIL VALIDATION
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    # 🔥 MOBILE VALIDATION (STRONG)
    def validate_mobile(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Mobile must contain only digits")

        if len(value) < 10 or len(value) > 12:
            raise serializers.ValidationError("Mobile must be 10-12 digits")

        return value

    # 🔥 PASSWORD VALIDATION
    def validate_password(self, value):

    # 🔥 Minimum 8 chars
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters"
            )

        # 🔥 1 uppercase
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain 1 capital letter"
            )

        # 🔥 1 number
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain 1 number"
            )

        # 🔥 1 special char
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError(
                "Password must contain 1 special character"
            )

        return value

    # 🔥 CREATE USER (SECURE)
    def create(self, validated_data):
        user = User(
            username=validated_data["email"],   # 🔥 username = email
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            mobile=validated_data["mobile"],
        )

        user.set_password(validated_data["password"])  # 🔥 HASH PASSWORD
        user.save()

        return user