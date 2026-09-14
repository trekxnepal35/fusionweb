"use client";

import { useEffect, useState } from "react";

export default function NavbarAdminPage() {

  // =====================================================
  // STATE
  // =====================================================

  const [menus, setMenus] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  

  const [form, setForm] = useState({
    title: "",
    slug: "",
    parentId: "",
    order: 0,
    target: "_self",
    active: true,
  });


  // =====================================================
  // LOAD MENUS
  // =====================================================

  async function loadMenus() {

    try {

      setLoading(true);

      const response = await fetch(
        "/api/menus",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {

        throw new Error(
          "Failed to fetch menus"
        );

      }

      const result =
        await response.json();


      if (result.success) {

        setMenus(
          Array.isArray(result.data)
            ? result.data
            : []
        );

      } else {

        console.error(
          result.message ||
            "Failed to load menus"
        );

        setMenus([]);

      }

    } catch (error) {

      console.error(
        "Load menus error:",
        error
      );

      setMenus([]);

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadMenus();

  }, []);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(e) {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setForm((previous) => ({

      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {

    setEditingId(null);

    setForm({
      title: "",
      slug: "",
      parentId: "",
      order: 0,
      target: "_self",
      active: true,
    });

  }


  // =====================================================
  // FIND DESCENDANTS
  // =====================================================

  function getDescendantIds(menuId) {

    const descendants = [];


    function findChildren(parentId) {

      const children = menus.filter(
        (menu) =>
          menu.parentId &&
          String(menu.parentId) ===
            String(parentId)
      );


      children.forEach((child) => {

        descendants.push(
          String(child._id)
        );

        findChildren(
          child._id
        );

      });

    }


    findChildren(menuId);


    return descendants;

  }


  // =====================================================
  // GET HIERARCHICAL PARENT OPTIONS
  // =====================================================

  function getMenuOptions(
    parentId = null,
    level = 0,
    excludeIds = []
  ) {

    const children = menus
      .filter((menu) => {

        if (parentId === null) {

          return !menu.parentId;

        }


        return (
          menu.parentId &&
          String(menu.parentId) ===
            String(parentId)
        );

      })
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      );


    let result = [];


    children.forEach((menu) => {

      const menuId =
        String(menu._id);


      if (
        !excludeIds.includes(menuId)
      ) {

        result.push({

          ...menu,

          level,

        });

      }


      result = result.concat(

        getMenuOptions(
          menu._id,
          level + 1,
          excludeIds
        )

      );

    });


    return result;

  }


  // =====================================================
  // CURRENT MENU + CHILDREN TO EXCLUDE
  // =====================================================

  const excludedIds = editingId
    ? [
        String(editingId),
        ...getDescendantIds(
          editingId
        ),
      ]
    : [];


  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  async function handleSubmit(e) {

    e.preventDefault();


    const title =
      form.title.trim();

    const slug =
      form.slug.trim();


    if (!title) {

      alert(
        "Please enter menu title."
      );

      return;

    }


    if (!slug) {

      alert(
        "Please enter menu URL."
      );

      return;

    }


    // ==========================================
    // PREVENT SELF PARENT
    // ==========================================

    if (
      editingId &&
      form.parentId &&
      String(editingId) ===
        String(form.parentId)
    ) {

      alert(
        "A menu cannot be its own parent."
      );

      return;

    }


    // ==========================================
    // PREVENT CIRCULAR PARENT
    // ==========================================

    if (
      editingId &&
      form.parentId
    ) {

      const descendants =
        getDescendantIds(
          editingId
        );


      if (
        descendants.includes(
          String(form.parentId)
        )
      ) {

        alert(
          "A child menu cannot become its parent's parent."
        );

        return;

      }

    }


    const url = editingId
      ? `/api/menus/${editingId}`
      : "/api/menus";


    const method = editingId
      ? "PUT"
      : "POST";


    try {

      setSaving(true);


      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              title,

              slug,

              parentId:
                form.parentId
                  ? form.parentId
                  : null,

              order:
                Number(form.order) || 0,

              target:
                form.target || "_self",

              active:
                Boolean(form.active),

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
            "Unable to save menu."
        );

        return;

      }


      resetForm();

      await loadMenus();


    } catch (error) {

      console.error(
        "Save menu error:",
        error
      );

      alert(
        "An error occurred while saving the menu."
      );

    } finally {

      setSaving(false);

    }

  }


  // =====================================================
  // EDIT
  // =====================================================

  function handleEdit(menu) {

    setEditingId(
      String(menu._id)
    );


    setForm({

      title:
        menu.title || "",

      slug:
        menu.slug || "",

      parentId:
        menu.parentId
          ? String(menu.parentId)
          : "",

      order:
        Number(menu.order) || 0,

      target:
        menu.target || "_self",

      active:
        menu.active !== false,

    });

  }


  // =====================================================
  // ADD CHILD
  // =====================================================

  function handleAddChild(
    parentMenu
  ) {

    setEditingId(null);


    setForm({

      title: "",

      slug: "",

      parentId:
        String(parentMenu._id),

      order: 0,

      target: "_self",

      active: true,

    });

  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(id) {

    const menu =
      menus.find(
        (item) =>
          String(item._id) ===
          String(id)
      );


    if (!menu) {

      return;

    }


    // ==========================================
    // CHECK CHILDREN
    // ==========================================

    const hasChildren =
      menus.some(
        (item) =>
          item.parentId &&
          String(item.parentId) ===
            String(id)
      );


    if (hasChildren) {

      alert(
        `Cannot delete "${menu.title}" because it has child menus.`
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Delete "${menu.title}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await fetch(
          `/api/menus/${id}`,
          {
            method: "DELETE",
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
            "Unable to delete menu."
        );

        return;

      }


      if (
        String(editingId) ===
        String(id)
      ) {

        resetForm();

      }


      await loadMenus();


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "An error occurred while deleting."
      );

    }

  }


  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  async function toggleActive(
    menu
  ) {

    try {

      const response =
        await fetch(
          `/api/menus/${menu._id}`,
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              title:
                menu.title,

              slug:
                menu.slug,

              parentId:
                menu.parentId ||
                null,

              order:
                Number(menu.order) || 0,

              target:
                menu.target ||
                "_self",

              active:
                menu.active === false,

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
            "Unable to update status."
        );

        return;

      }


      await loadMenus();


    } catch (error) {

      console.error(
        "Toggle status error:",
        error
      );

      alert(
        "Unable to update menu status."
      );

    }

  }


  // =====================================================
  // RENDER TREE
  // =====================================================

  function renderMenuTree(
    parentId = null,
    level = 0
  ) {

    const children =
      menus
        .filter((menu) => {

          if (parentId === null) {

            return !menu.parentId;

          }


          return (
            menu.parentId &&
            String(menu.parentId) ===
              String(parentId)
          );

        })
        .sort(
          (a, b) =>
            Number(a.order || 0) -
            Number(b.order || 0)
        );


    if (children.length === 0) {

      return null;

    }


    return children.map(
      (menu) => {

        const hasChildren =
          menus.some(
            (child) =>
              child.parentId &&
              String(child.parentId) ===
                String(menu._id)
          );


        return (

          <div
            key={String(menu._id)}
          >

            {/* =================================
                MENU
            ================================= */}

            <div
              className="
                border-b
                px-4
                py-4
                hover:bg-gray-50
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  gap-4
                "
              >

                {/* MENU NAME */}

                <div
                  className="
                    flex-1
                    min-w-0
                  "
                  style={{
                    paddingLeft:
                      `${level * 30}px`,
                  }}
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        text-gray-400
                        select-none
                      "
                    >
                      {level > 0
                        ? "└─"
                        : "●"}
                    </span>


                    <span
                      className="
                        font-semibold
                        truncate
                      "
                    >
                      {menu.title}
                    </span>

                  </div>


                  <div
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                      ml-6
                      truncate
                    "
                  >
                    {menu.slug}
                  </div>

                </div>


                {/* LEVEL */}

                <div
                  className="
                    text-sm
                    text-gray-500
                    lg:w-12
                  "
                >
                  Level {level}
                </div>


                {/* ORDER */}

                <div
                  className="
                    text-sm
                    text-gray-500
                    lg:w-12
                  "
                >
                  Order: {menu.order || 0}
                </div>


                {/* STATUS */}

                <button
                  type="button"
                  onClick={() =>
                    toggleActive(menu)
                  }
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-medium
                    w-fit

                    ${
                      menu.active !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >

                  {menu.active !== false
                    ? "Active"
                    : "Inactive"}

                </button>


                {/* ACTIONS */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {/* CHILD */}

                  <button
                    type="button"
                    onClick={() =>
                      handleAddChild(
                        menu
                      )
                    }
                    className="
                      border
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      hover:bg-gray-100
                    "
                  >
                    + Child
                  </button>


                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(menu)
                    }
                    className="
                      border
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      hover:bg-gray-100
                    "
                  >
                    Edit
                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        menu._id
                      )
                    }
                    className="
                      border
                      border-red-200
                      text-red-600
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      hover:bg-red-50
                    "
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>


            {/* =================================
                CHILDREN
            ================================= */}

            {hasChildren && (

              <div>

                {renderMenuTree(
                  menu._id,
                  level + 1
                )}

              </div>

            )}

          </div>

        );

      }
    );

  }


  // Logout Function

  async function handleLogout() {

    try {
  
      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );
  
  
      window.location.href =
        "/admin/login";
  
  
    } catch (error) {
  
      console.error(
        "Logout error:",
        error
      );
  
    }
  
  }

  // =====================================================
  // PAGE UI
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

      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <div className="mb-8">

        <h1
          className="
            text-3xl
            md:text-4xl
            font-bold
          "
        >
          Navbar Management
        </h1>

<div className="flex justify-between">
<p
          className="
            text-gray-500
            mt-2
          "
        >
          Manage your dynamic nested
          navigation menu.
        </p>
        <button
  type="button"
  onClick={handleLogout}
  className="
    bg-red-600
    text-white
    px-4
    py-2
    rounded-lg
    hover:bg-red-700
  "
>
  Logout
</button>

</div>
       

      </div>


      {/* ============================================
          FORM
      ============================================ */}

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

        <div
          className="
            flex
            items-center
            justify-between
            mb-6
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-semibold
              "
            >

              {editingId
                ? "Edit Menu"
                : "Create Menu"}

            </h2>


            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >

              {editingId
                ? "Update this navigation item."
                : "Add a new navigation item."}

            </p>

          </div>


          {editingId && (

            <button
              type="button"
              onClick={resetForm}
              className="
                text-sm
                text-gray-500
                hover:text-black
              "
            >
              Cancel
            </button>

          )}

        </div>


        <form
          onSubmit={handleSubmit}
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >

          {/* TITLE */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Menu Title
            </label>


            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Activities"
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


          {/* SLUG */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              URL / Slug
            </label>


            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="/activities"
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


          {/* PARENT */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Parent Menu
            </label>


            <select
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
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
            >

              <option value="">
                Main Menu
              </option>


              {getMenuOptions(
                null,
                0,
                excludedIds
              ).map((menu) => (

                <option
                  key={String(menu._id)}
                  value={String(menu._id)}
                >

                  {"— ".repeat(menu.level)}

                  {menu.title}

                </option>

              ))}

            </select>

          </div>


          {/* ORDER */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Order
            </label>


            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleChange}
              min="0"
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


          {/* TARGET */}

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Link Target
            </label>


            <select
              name="target"
              value={form.target}
              onChange={handleChange}
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
            >

              <option value="_self">
                Same Window
              </option>

              <option value="_blank">
                New Window
              </option>

            </select>

          </div>


          {/* ACTIVE */}

          <div
            className="
              flex
              items-center
            "
          >

            <label
              className="
                flex
                items-center
                gap-3
                cursor-pointer
              "
            >

              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="
                  w-5
                  h-5
                "
              />


              <span className="font-medium">
                Active
              </span>

            </label>

          </div>


          {/* BUTTONS */}

          <div
            className="
              md:col-span-2
              flex
              gap-3
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
                hover:bg-gray-800
                disabled:opacity-50
              "
            >

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Menu"
                  : "Create Menu"}

            </button>


            {editingId && (

              <button
                type="button"
                onClick={resetForm}
                className="
                  border
                  px-6
                  py-3
                  rounded-lg
                  hover:bg-gray-50
                "
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </section>


      {/* ============================================
          MENU TREE
      ============================================ */}

      <section
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >

        {/* HEADER */}

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
            Navigation Structure
          </h2>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Parent and child menus.
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
            Loading menus...
          </div>

        ) : menus.length === 0 ? (

          <div
            className="
              p-10
              text-center
              text-gray-500
            "
          >
            No menus found.
          </div>

        ) : (

          renderMenuTree()

        )}

      </section>

    </main>

  );

}