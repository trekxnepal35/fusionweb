"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  /*
  ==============================================
  LOAD CONTACTS
  ==============================================
  */

  async function loadContacts(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        "/api/contact?page=1&limit=100",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load contact messages."
        );
      }

      setContacts(data.contacts || []);
    } catch (error) {
      console.error("CONTACT LOAD ERROR:", error);
      alert(
        error.message ||
          "Failed to load contact messages."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /*
  ==============================================
  INITIAL LOAD
  ==============================================
  */

  useEffect(() => {
    loadContacts();
  }, []);

  /*
  ==============================================
  FILTER CONTACTS
  ==============================================
  */

  const filteredContacts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      /*
      ============================================
      STATUS FILTER
      ============================================
      */

      if (
        statusFilter !== "all" &&
        contact.status !== statusFilter
      ) {
        return false;
      }

      /*
      ============================================
      SEARCH
      ============================================
      */

      if (!searchText) {
        return true;
      }

      const searchableText = [
        contact.name,
        contact.email,
        contact.phone,
        contact.subject,
        contact.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [contacts, statusFilter, search]);

  /*
  ==============================================
  STATISTICS
  ==============================================
  */

  const totalCount = contacts.length;

  const newCount = contacts.filter(
    (contact) => contact.status === "new"
  ).length;

  const readCount = contacts.filter(
    (contact) => contact.status === "read"
  ).length;

  const repliedCount = contacts.filter(
    (contact) => contact.status === "replied"
  ).length;

  const archivedCount = contacts.filter(
    (contact) => contact.status === "archived"
  ).length;

  /*
  ==============================================
  STATUS STYLE
  ==============================================
  */

  function getStatusClass(status) {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";

      case "read":
        return "bg-yellow-100 text-yellow-700";

      case "replied":
        return "bg-green-100 text-green-700";

      case "archived":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /*
  ==============================================
  FORMAT STATUS
  ==============================================
  */

  function formatStatus(status) {
    if (!status) {
      return "";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  /*
  ==============================================
  FORMAT DATE
  ==============================================
  */

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  }

  /*
  ==============================================
  UPDATE STATUS
  ==============================================
  */

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `/api/contact/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update contact status."
        );
      }

      setContacts((previous) =>
        previous.map((contact) =>
          contact._id === id
            ? {
                ...contact,
                status: data.contact?.status || status,
              }
            : contact
        )
      );
    } catch (error) {
      console.error("CONTACT STATUS ERROR:", error);

      alert(
        error.message ||
          "Failed to update contact status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
  ==============================================
  DELETE CONTACT
  ==============================================
  */

  async function deleteContact(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact message?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/contact/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete contact message."
        );
      }

      setContacts((previous) =>
        previous.filter(
          (contact) => contact._id !== id
        )
      );
    } catch (error) {
      console.error("CONTACT DELETE ERROR:", error);

      alert(
        error.message ||
          "Failed to delete contact message."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
  ==============================================
  LOADING
  ==============================================
  */

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            Loading contact messages...
          </p>
        </div>
      </div>
    );
  }

  /*
  ==============================================
  PAGE
  ==============================================
  */

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Contact Messages
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage messages submitted through the
            website contact form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadContacts(false)}
          disabled={refreshing}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            New
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {newCount}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Read
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {readCount}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Replied
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {repliedCount}
          </p>
        </div>

        <div className="col-span-2 rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
          <p className="text-sm text-gray-500">
            Archived
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {archivedCount}
          </p>
        </div>
      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {/* SEARCH */}

          <div>
            <label
              htmlFor="contact-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="contact-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email, subject, message..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* STATUS */}

          <div>
            <label
              htmlFor="contact-status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="contact-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">
                Archived
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================
          RESULTS COUNT
      ======================================== */}

      <div className="text-sm text-gray-500">
        Showing {filteredContacts.length} of{" "}
        {contacts.length} contact messages
      </div>

      {/* ========================================
          CONTACT LIST
      ======================================== */}

      {filteredContacts.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No contact messages found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Try changing your search or status
            filter.
          </p>
        </div>
      ) : (
        <>
          {/* ======================================
              DESKTOP TABLE
          ====================================== */}

          <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Message
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="align-top hover:bg-gray-50"
                    >
                      {/* CONTACT */}

                      <td className="px-5 py-5">
                        <div className="font-semibold text-gray-900">
                          {contact.name}
                        </div>

                        <div className="mt-1 text-sm text-gray-600">
                          {contact.email}
                        </div>

                        {contact.phone && (
                          <div className="mt-1 text-sm text-gray-500">
                            {contact.phone}
                          </div>
                        )}
                      </td>

                      {/* SUBJECT */}

                      <td className="max-w-xs px-5 py-5">
                        <p className="font-medium text-gray-900">
                          {contact.subject}
                        </p>
                      </td>

                      {/* MESSAGE */}

                      <td className="max-w-sm px-5 py-5">
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                          {contact.message}
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">
                        <select
                          value={contact.status}
                          disabled={
                            updatingId === contact._id
                          }
                          onChange={(event) =>
                            updateStatus(
                              contact._id,
                              event.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(
                            contact.status
                          )}`}
                        >
                          <option value="new">
                            New
                          </option>

                          <option value="read">
                            Read
                          </option>

                          <option value="replied">
                            Replied
                          </option>

                          <option value="archived">
                            Archived
                          </option>
                        </select>
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-500">
                        {formatDate(
                          contact.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            deleteContact(contact._id)
                          }
                          disabled={
                            deletingId === contact._id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === contact._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================
              MOBILE CARDS
          ====================================== */}

          <div className="space-y-4 lg:hidden">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                {/* HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-gray-900">
                      {contact.name}
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-600">
                      {contact.email}
                    </p>

                    {contact.phone && (
                      <p className="mt-1 text-sm text-gray-500">
                        {contact.phone}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      contact.status
                    )}`}
                  >
                    {formatStatus(contact.status)}
                  </span>
                </div>

                {/* SUBJECT */}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Subject
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {contact.subject}
                  </p>
                </div>

                {/* MESSAGE */}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Message
                  </p>

                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                    {contact.message}
                  </p>
                </div>

                {/* DATE */}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Received
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(contact.createdAt)}
                  </p>
                </div>

                {/* STATUS CONTROL */}

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Update Status
                  </label>

                  <select
                    value={contact.status}
                    disabled={
                      updatingId === contact._id
                    }
                    onChange={(event) =>
                      updateStatus(
                        contact._id,
                        event.target.value
                      )
                    }
                    className={`w-full rounded-lg border-0 px-4 py-2.5 text-sm font-semibold outline-none ${getStatusClass(
                      contact.status
                    )}`}
                  >
                    <option value="new">
                      New
                    </option>

                    <option value="read">
                      Read
                    </option>

                    <option value="replied">
                      Replied
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </div>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    deleteContact(contact._id)
                  }
                  disabled={
                    deletingId === contact._id
                  }
                  className="mt-4 w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === contact._id
                    ? "Deleting..."
                    : "Delete Message"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}