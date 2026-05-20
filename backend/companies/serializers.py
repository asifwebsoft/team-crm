from rest_framework import serializers
from .models import Company
import re


class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = '__all__'

    def validate_name(self, value):

        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Company name minimum 3 characters."
            )

        return value.strip()

    def validate_contact_number(self, value):

        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Enter valid 10 digit mobile number."
            )

        return value

    def validate_email(self, value):

        if Company.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value.lower()

    def validate_gstin(self, value):

        if value:

            gstin_regex = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'

            if not re.match(gstin_regex, value):
                raise serializers.ValidationError(
                    "Invalid GSTIN number."
                )

        return value.upper()