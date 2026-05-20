from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Company
from .serializers import CompanySerializer


class CreateCompanyView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != "admin":
            return Response(
                {"error": "Only admin"},
                status=403
            )

        serializer = CompanySerializer(
            data=request.data
        )

        if serializer.is_valid():

            company = serializer.save(
                owner=request.user
            )

            request.user.company = company
            request.user.save()

            return Response({
                "message": "Company created"
            })

        print(serializer.errors)

        return Response(
            serializer.errors,
            status=400
        )