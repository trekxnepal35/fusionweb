"use client";

import { useEffect, useState } from "react";

export default function MenuAdminPage() {

  const [menus, setMenus] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    parentId: "",
    order: 0,
    active: true,
    target: "_self",
    icon: "",
  });


  useEffect(() => {
    fetchMenus();
  }, []);


  async function fetchMenus() {

    try {

      const response = await fetch("/api/menus");

      const result = await response.json();

      if (result.success) {
        setMenus(result.data);
      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }


  function handleChange(event) {

    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

  }

//   Create handleSubmit
async function handleSubmit(event) {

    event.preventDefault();
  
  
    try {
  
      const url = editingId
        ? `/api/menu/${editingId}`
        : "/api/menu";
  
  
      const method = editingId
        ? "PUT"
        : "POST";
  
  
      const response = await fetch(url, {
  
        method,
  
        headers: {
          "Content-Type": "application/json",
        },
  
        body: JSON.stringify({
          ...formData,
  
          parentId:
            formData.parentId || null,
  
          order:
            Number(formData.order),
        }),
  
      });
  
  
      const result = await response.json();
  
  
      if (!response.ok) {
  
        alert(result.message || "Operation failed");
  
        return;
      }
  
  
      alert(
        editingId
          ? "Menu updated successfully"
          : "Menu created successfully"
      );
  
  
      setFormData({
        title: "",
        slug: "",
        parentId: "",
        order: 0,
        active: true,
        target: "_self",
        icon: "",
      });
  
  
      setEditingId(null);
  
      setShowForm(false);
  
      fetchMenus();
  
  
    } catch (error) {
  
      console.error("MENU ERROR:", error);
  
      alert("Something went wrong");
  
    }
  
  }

//   Edit

function editMenu(menu) {

    setEditingId(menu._id);
  
    setFormData({
      title: menu.title,
      slug: menu.slug,
      parentId: menu.parentId || "",
      order: menu.order,
      active: menu.active,
      target: menu.target,
      icon: menu.icon || "",
    });
  
    setShowForm(true);
  
  }

//   Delete
async function deleteMenu(id) {

    const confirmed = window.confirm(
      "Are you sure you want to delete this menu?"
    );
  
    if (!confirmed) {
      return;
    }
  
  
    try {
  
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });
  
  
      const result = await response.json();
  
  
      if (!response.ok) {
  
        alert(result.message || "Failed to delete menu");
  
        return;
      }
  
  
      alert("Menu deleted successfully");
  
      fetchMenus();
  
    } catch (error) {
  
      console.error("DELETE MENU ERROR:", error);
  
      alert("Something went wrong");
  
    }
  
  }

  return (
    <main className="max-w-6xl mx-auto p-6">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Menu Management
        </h1>

        <button
          onClick={() => {

            setEditingId(null);
          
            setFormData({
              title: "",
              slug: "",
              parentId: "",
              order: 0,
              active: true,
              target: "_self",
              icon: "",
            });
          
            setShowForm(true);
          
          }}
          className="bg-black text-white px-5 py-3 rounded-lg"
        >
          + Add Menu
        </button>

      </div>


      {showForm && (

        <form className="border rounded-xl p-6 mb-8" onSubmit={handleSubmit} >

            <h2 className="text-xl font-semibold mb-5">
            {editingId ? "Edit Menu" : "Add Menu"}
            </h2>


          <div className="grid md:grid-cols-2 gap-5">


            <div>

              <label className="block mb-2">
                Menu Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="Example: Everest"
              />

            </div>


            <div>

              <label className="block mb-2">
                URL
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="/everest"
              />

            </div>


            <div>

              <label className="block mb-2">
                Parent Menu
              </label>

              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  No Parent
                </option>

                {menus.map((menu) => (

                  <option
                    key={menu._id}
                    value={menu._id}
                  >
                    {menu.title}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label className="block mb-2">
                Order
              </label>

              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>


            <div>

              <label className="block mb-2">
                Target
              </label>

              <select
                name="target"
                value={formData.target}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              >

                <option value="_self">
                  Same Tab
                </option>

                <option value="_blank">
                  New Tab
                </option>

              </select>

            </div>


            <div>

              <label className="block mb-2">
                Icon
              </label>

              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="mountain"
              />

            </div>

          </div>


          <div className="mt-5">
            

            <label className="flex gap-2 items-center">

              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              

              Active
              

            </label>
            

          </div>


          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Save Menu
          </button>

        </form>

      )}


      {loading ? (

        <p>Loading...</p>

      ) : (

        <div className="space-y-3">

          {menus.map((menu) => (

            <div
              key={menu._id}
              className="border rounded-lg p-4 flex justify-between"
            >

              <div>

                <h3 className="font-semibold">
               
            
            {menu.title}
          
                </h3>

                <p className="text-sm text-gray-500">
                  {menu.slug}
                </p>
                <span
                    className={
                        menu.active
                        ? "text-green-600"
                        : "text-red-600"
                    }
                    >
  {menu.active ? "Active" : "Hidden"}
</span>
              </div>

              <div className="flex gap-2">

                <button
                onClick={() => editMenu(menu)}
                className="px-4 py-2 border rounded"
                >
                Edit
                </button>

                <button className="px-4 py-2 bg-red-600 text-white rounded"  onClick={() => deleteMenu(menu._id)}>
                  Delete
                </button>

              </div>
             

            </div>

          ))}
          

        </div>

      )}

    </main>
  );
}