"use client";

import { useEffect, useState } from "react";


export default function AdminUsersPage() {

  // =====================================================
  // STATE
  // =====================================================

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [resettingId, setResettingId] =
    useState(null);


  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
    });


  const [resetForm, setResetForm] =
    useState({
      password: "",
      confirmPassword: "",
    });


  const [resetUserId, setResetUserId] =
    useState(null);


  // =====================================================
  // LOAD USERS
  // =====================================================

  async function loadUsers() {

    try {

      setLoading(true);


      const response =
        await fetch(
          "/api/admin/users",
          {
            cache: "no-store",
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
            "Failed to load users."
        );

      }


      setUsers(
        Array.isArray(result.data)
          ? result.data
          : []
      );


    } catch (error) {

      console.error(
        "Load users error:",
        error
      );


      alert(
        error.message ||
          "Unable to load users."
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadUsers();

  }, []);


  // =====================================================
  // CREATE USER FORM CHANGE
  // =====================================================

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (previous) => ({

        ...previous,

        [name]:
          value,

      })
    );

  }


  // =====================================================
  // CREATE USER
  // =====================================================

  async function handleCreateUser(e) {

    e.preventDefault();


    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {

      alert(
        "Please fill in all fields."
      );

      return;

    }


    if (
      form.password.length < 8
    ) {

      alert(
        "Password must be at least 8 characters."
      );

      return;

    }


    try {

      setSaving(true);


      const response =
        await fetch(
          "/api/admin/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                email:
                  form.email.trim(),

                password:
                  form.password,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        alert(
          result.message ||
            "Unable to create user."
        );

        return;

      }


      alert(
        "Admin user created successfully."
      );


      setForm({

        name: "",

        email: "",

        password: "",

      });


      await loadUsers();


    } catch (error) {

      console.error(
        "Create user error:",
        error
      );


      alert(
        "Unable to create user."
      );


    } finally {

      setSaving(false);

    }

  }


  // =====================================================
  // OPEN RESET PASSWORD
  // =====================================================

  function openResetPassword(user) {

    setResetUserId(
      String(user.id)
    );


    setResetForm({

      password: "",

      confirmPassword: "",

    });

  }


  // =====================================================
  // CLOSE RESET PASSWORD
  // =====================================================

  function closeResetPassword() {

    setResetUserId(null);


    setResetForm({

      password: "",

      confirmPassword: "",

    });

  }


  // =====================================================
  // RESET PASSWORD FORM CHANGE
  // =====================================================

  function handleResetChange(e) {

    const {
      name,
      value,
    } = e.target;


    setResetForm(
      (previous) => ({

        ...previous,

        [name]:
          value,

      })
    );

  }


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async function handleResetPassword(
    e
  ) {

    e.preventDefault();


    if (!resetForm.password) {

      alert(
        "Please enter a new password."
      );

      return;

    }


    if (
      resetForm.password.length < 8
    ) {

      alert(
        "Password must be at least 8 characters."
      );

      return;

    }


    if (
      resetForm.password !==
      resetForm.confirmPassword
    ) {

      alert(
        "Passwords do not match."
      );

      return;

    }


    try {

      setResettingId(
        resetUserId
      );


      const response =
        await fetch(
          `/api/admin/users/${resetUserId}/reset-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                password:
                  resetForm.password,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        alert(
          result.message ||
            "Unable to reset password."
        );

        return;

      }


      alert(
        "Password reset successfully."
      );


      closeResetPassword();


    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );


      alert(
        "Unable to reset password."
      );


    } finally {

      setResettingId(null);

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <main
      className="
        max-w-7xl
        mx-auto
        px-4
        py-8
        md:px-8
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-8
        "
      >

        <h1
          className="
            text-3xl
            md:text-4xl
            font-bold
          "
        >
          User Management
        </h1>


        <p
          className="
            text-gray-500
            mt-2
          "
        >
          Create admin users and manage passwords.
        </p>

      </div>


      {/* =================================================
          CREATE USER
      ================================================= */}

      <section
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-5
          md:p-7
          mb-10
        "
      >

        <h2
          className="
            text-xl
            font-semibold
            mb-1
          "
        >
          Create Admin User
        </h2>


        <p
          className="
            text-sm
            text-gray-500
            mb-6
          "
        >
          Add another administrator to the dashboard.
        </p>


        <form
          onSubmit={handleCreateUser}
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >

          {/* NAME */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Name
            </label>


            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Admin Name"
              autoComplete="name"
              required
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-black
              "
            />

          </div>


          {/* EMAIL */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Email
            </label>


            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-black
              "
            />

          </div>


          {/* PASSWORD */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Password
            </label>


            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-black
              "
            />

          </div>


          {/* BUTTON */}

          <div
            className="
              md:col-span-3
            "
          >

            <button
              type="submit"
              disabled={saving}
              className="
                bg-black
                text-white
                px-6
                py-3
                rounded-lg
                font-medium
                hover:bg-gray-800
                disabled:opacity-50
              "
            >

              {saving
                ? "Creating..."
                : "Create Admin User"}

            </button>

          </div>

        </form>

      </section>


      {/* =================================================
          USERS LIST
      ================================================= */}

      <section
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            p-5
            md:p-6
            border-b
          "
        >

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            Admin Users
          </h2>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Existing administrator accounts.
          </p>

        </div>


        {/* LOADING */}

        {loading ? (

          <div
            className="
              p-10
              text-center
              text-gray-500
            "
          >
            Loading users...
          </div>

        ) : users.length === 0 ? (

          <div
            className="
              p-10
              text-center
              text-gray-500
            "
          >
            No admin users found.
          </div>

        ) : (

          <div
            className="
              divide-y
            "
          >

            {users.map((user) => (

              <div
                key={user.id}
                className="
                  p-5
                  md:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                  "
                >

                  {/* USER INFO */}

                  <div>

                    <div
                      className="
                        font-semibold
                        text-lg
                      "
                    >
                      {user.name}
                    </div>


                    <div
                      className="
                        text-gray-500
                        text-sm
                        mt-1
                      "
                    >
                      {user.email}
                    </div>


                    <div
                      className="
                        text-xs
                        text-gray-400
                        mt-1
                      "
                    >
                      Role: {user.role}
                    </div>

                  </div>


                  {/* RESET */}

                  <button
                    type="button"
                    onClick={() =>
                      openResetPassword(
                        user
                      )
                    }
                    className="
                      border
                      border-red-200
                      text-red-600
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      hover:bg-red-50
                      w-fit
                    "
                  >
                    Reset Password
                  </button>

                </div>


                {/* =======================================
                    RESET PASSWORD FORM
                ======================================== */}

                {String(resetUserId) ===
                  String(user.id) && (

                  <form
                    onSubmit={
                      handleResetPassword
                    }
                    className="
                      mt-5
                      p-5
                      bg-gray-50
                      border
                      rounded-xl
                    "
                  >

                    <h3
                      className="
                        font-semibold
                        mb-4
                      "
                    >
                      Reset Password for {user.name}
                    </h3>


                    <div
                      className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                      "
                    >

                      {/* NEW PASSWORD */}

                      <div>

                        <label
                          className="
                            block
                            font-medium
                            mb-2
                          "
                        >
                          New Password
                        </label>


                        <input
                          type="password"
                          name="password"
                          value={
                            resetForm.password
                          }
                          onChange={
                            handleResetChange
                          }
                          placeholder="Minimum 8 characters"
                          autoComplete="new-password"
                          minLength={8}
                          required
                          className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-black
                          "
                        />

                      </div>


                      {/* CONFIRM */}

                      <div>

                        <label
                          className="
                            block
                            font-medium
                            mb-2
                          "
                        >
                          Confirm Password
                        </label>


                        <input
                          type="password"
                          name="confirmPassword"
                          value={
                            resetForm.confirmPassword
                          }
                          onChange={
                            handleResetChange
                          }
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          minLength={8}
                          required
                          className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-black
                          "
                        />

                      </div>

                    </div>


                    <div
                      className="
                        flex
                        gap-3
                        mt-5
                      "
                    >

                      <button
                        type="submit"
                        disabled={
                          resettingId ===
                          String(user.id)
                        }
                        className="
                          bg-black
                          text-white
                          px-5
                          py-2.5
                          rounded-lg
                          hover:bg-gray-800
                          disabled:opacity-50
                        "
                      >

                        {resettingId ===
                        String(user.id)
                          ? "Resetting..."
                          : "Reset Password"}

                      </button>


                      <button
                        type="button"
                        onClick={
                          closeResetPassword
                        }
                        className="
                          border
                          px-5
                          py-2.5
                          rounded-lg
                          hover:bg-white
                        "
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </main>

  );

}