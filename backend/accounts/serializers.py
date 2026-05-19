from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["full_name", "email", "mobile", "password"]

    # 🔥 FULL NAME VALIDATION
    def validate_full_name(self, value):

        # ❌ Numbers not allowed
        if any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Name cannot contain numbers"
            )

        # ❌ Minimum length
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Name must be at least 3 characters"
            )

        # ❌ Only letters and spaces
        if not re.match(r"^[A-Za-z ]+$", value):
            raise serializers.ValidationError(
                "Name can contain only letters"
            )

        return value.strip()

    # 🔥 EMAIL VALIDATION
    def validate_email(self, value):

        value = value.strip().lower()

        # ❌ Proper email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$'

        if not re.match(email_regex, value):
            raise serializers.ValidationError(
                "Enter a valid email address"
            )

        # ❌ Duplicate email
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists"
            )

        return value

    # 🔥 MOBILE VALIDATION
    def validate_mobile(self, value):

        value = value.strip()

        # ❌ Digits only
        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile must contain only digits"
            )

        # ❌ Min/Max length
        if len(value) < 10 or len(value) > 12:
            raise serializers.ValidationError(
                "Mobile must be 10-12 digits"
            )

        return value

    # 🔥 PASSWORD VALIDATION
    def validate_password(self, value):

        # ❌ Minimum 8 chars
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters"
            )

        # ❌ 1 uppercase letter
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain 1 capital letter"
            )

        # ❌ 1 numeric digit
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain 1 number"
            )

        # ❌ 1 special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError(
                "Password must contain 1 special character"
            )

        return value

    # 🔥 CREATE USER
    def create(self, validated_data):

        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            mobile=validated_data["mobile"],
        )

        # 🔥 HASH PASSWORD
        user.set_password(validated_data["password"])

        user.save()

        return user