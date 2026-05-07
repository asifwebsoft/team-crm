from django.urls import path
from .views import CreateLeadView,UpdateLeadView, MyLeadsView, DeleteLeadView, ManagerDashboardView, AssignLeadView, DashboardView, NotificationView, TeamPerformanceView, ConversionView, FollowupReminderView

urlpatterns = [
    path('create/', CreateLeadView.as_view()),
    path('my-leads/', MyLeadsView.as_view()),
    path('dashboard/', DashboardView.as_view()),
    path('team-performance/', TeamPerformanceView.as_view()),
    path('conversion/', ConversionView.as_view()),
    path('followups/', FollowupReminderView.as_view()),
    path('notifications/', NotificationView.as_view()),
    path('update/<int:pk>/', UpdateLeadView.as_view()),
    path('assign/<int:pk>/', AssignLeadView.as_view()),
    path("manager-dashboard/", ManagerDashboardView.as_view()),
    path("delete/<int:pk>/", DeleteLeadView.as_view()),
    
    
]