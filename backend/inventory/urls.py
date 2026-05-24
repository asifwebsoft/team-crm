from django.urls import path
from .views import InventoryListCreateView, PurchaseEntryView


urlpatterns = [
    path(
        "",
        InventoryListCreateView.as_view()
    ),

    path(
    "purchase-entry/",
    PurchaseEntryView.as_view()
),
]