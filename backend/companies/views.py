from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Company

class CreateCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != "admin":
            return Response({"error": "Only admin"}, status=403)

        name = request.data.get("name")

        # 🔥 OWNER FIX
        company = Company.objects.create(
            name=name,
            owner=request.user   # 👈 यही missing था
        )

        # 🔥 admin को company assign करो
        request.user.company = company
        request.user.save()

        return Response({"message": "Company created"})