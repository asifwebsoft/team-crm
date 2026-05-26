from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import (
    IsAuthenticated
)

from .models import Expense

from .serializers import (
    ExpenseSerializer
)


class ExpenseListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        # ✅ STAFF BLOCK

        if request.user.role == "staff":

            return Response(
                {
                    "error":
                    "Permission denied"
                },
                status=403
            )

        expenses = Expense.objects.filter(

            company=
                request.user.company

        ).order_by("-id")

        serializer = ExpenseSerializer(
                expenses,
                many=True
            )

        return Response(
            serializer.data
        )

    def post(self, request):

        # ✅ STAFF BLOCK

        if request.user.role == "staff":

            return Response(
                {
                    "error":
                    "Permission denied"
                },
                status=403
            )

        data = request.data.copy()

        data["company"] = (
            request.user.company.id
        )

        data["created_by"] = (
            request.user.id
        )

        serializer = ExpenseSerializer(
                data=data
            )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )