"use client";

export default function LogoutButton() {

  const handleLogout = async () => {

    try {

      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {

        console.error(
          "Logout failed:",
          response.status
        );

      }

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    } finally {

      window.location.href =
        "/admin/login";

    }

  };


  return (

    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
    >
      Logout
    </button>

  );

}