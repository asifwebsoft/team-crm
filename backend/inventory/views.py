from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import InventoryItem
from .serializers import InventorySerializer


class InventoryListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        items = InventoryItem.objects.filter(
            company=company
        ).order_by("-id")

        serializer = InventorySerializer(items, many=True)

        return Response(serializer.data)

    def post(self, request):

        data = request.data.copy()

        data["company"] = request.user.company.id

        serializer = InventorySerializer(data=data)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)