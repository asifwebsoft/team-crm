from django.urls import path
from .views import (
LoginView, 
AdminSignupView, 
StaffSignupView, 
StaffListView, 
ResetPasswordView,
ForgotPasswordView, 
LoginActivityView, 
LogoutView, 
UpdateStaffView,
DeleteStaffView
)
urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("admin-signup/", AdminSignupView.as_view()),
    path("staff-signup/", StaffSignupView.as_view()),
    path("staff-list/", StaffListView.as_view()),
    path("login-activity/", LoginActivityView.as_view()),
    path("staff/update/<int:pk>/", UpdateStaffView.as_view()),
    path("staff/delete/<int:pk>/", DeleteStaffView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/",ResetPasswordView.as_view(),
),
]