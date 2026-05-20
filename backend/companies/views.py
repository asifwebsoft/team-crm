from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Company
from .serializers import CompanySerializer

import random


class CreateCompanyView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != "admin":
            return Response(
                {"error": "Only admin"},
                status=403
            )

        serializer = CompanySerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():

            code = "CMP" + str(
                random.randint(10000, 99999)
            )

            company = serializer.save(
                owner=request.user,
                company_code=code
            )

            request.user.company = company
            request.user.save()

            return Response({
                "message": "Company created"
            })

        return Response(
            serializer.errors,
            status=400
        )


class UpdateCompanyView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        company = request.user.company

        serializer = CompanySerializer(
            company,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "message": "Company updated"
            })

        return Response(
            serializer.errors,
            status=400
        )