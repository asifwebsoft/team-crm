from rest_framework import serializers
from .models import Company
import re


class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['owner']

    def validate_name(self, value):

        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Company name minimum 3 characters."
            )

        return value

    def validate_contact_number(self, value):

        value = value.strip()

        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Enter valid mobile number."
            )

        return value

    def validate_email(self, value):

        value = value.lower().strip()

        existing = Company.objects.filter(
            email=value
        ).exclude(
            owner=self.context['request'].user
        )

        if existing.exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_gstin(self, value):

        if not value:
            return value

        value = value.upper().strip()

        gstin_regex = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'

        if not re.match(gstin_regex, value):
            raise serializers.ValidationError(
                "Invalid GSTIN number."
            )

        existing = Company.objects.filter(
            gstin=value
        ).exclude(
            owner=self.context['request'].user
        )

        if existing.exists():
            raise serializers.ValidationError(
                "GSTIN already exists."
            )

        return value