"use client";

export default function AdminMenuTree({
  menus = [],
  parentId = null,
  level = 0,
  onEdit,
  onDelete,
  onToggle,
  onAddChild,
}) {

  const children = menus
    .filter((menu) => {

      if (parentId === null) {
        return !menu.parentId;
      }

      return (
        menu.parentId &&
        String(menu.parentId) === String(parentId)
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


  return (
    <div>

      {children.map((menu) => {

        const hasChildren = menus.some(
          (child) =>
            child.parentId &&
            String(child.parentId) === String(menu._id)
        );


        return (
          <div key={String(menu._id)}>

            {/* MENU ROW */}

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                px-4
                py-3
                hover:bg-gray-50
              "
            >

              {/* INDENT */}

              <div
                style={{
                  width: `${level * 28}px`,
                }}
              />


              {/* TREE SYMBOL */}

              <div className="w-6 text-gray-400">

                {level > 0 ? "└─" : "•"}

              </div>


              {/* MENU INFO */}

              <div className="flex-1 min-w-0">

                <div className="font-medium">
                  {menu.title}
                </div>

                <div className="text-xs text-gray-500 truncate">
                  {menu.slug}
                </div>

              </div>


              {/* LEVEL */}

              <div className="hidden md:block text-xs text-gray-400">
                Level {level}
              </div>


              {/* ORDER */}

              <div className="w-12 text-center">
                {menu.order || 0}
              </div>


              {/* STATUS */}

              <button
                type="button"
                onClick={() => onToggle(menu)}
                className={`
                  hidden
                  sm:block
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-medium

                  ${
                    menu.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >

                {menu.active
                  ? "Active"
                  : "Inactive"}

              </button>


              {/* ADD CHILD */}

              <button
                type="button"
                onClick={() => onAddChild(menu)}
                className="
                  hidden
                  md:block
                  px-3
                  py-2
                  rounded-lg
                  border
                  text-sm
                  hover:bg-gray-50
                "
              >
                + Child
              </button>


              {/* EDIT */}

              <button
                type="button"
                onClick={() => onEdit(menu)}
                className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  text-sm
                  hover:bg-gray-50
                "
              >
                Edit
              </button>


              {/* DELETE */}

              <button
                type="button"
                onClick={() => onDelete(menu._id)}
                className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  text-sm
                  text-red-600
                  hover:bg-red-50
                "
              >
                Delete
              </button>

            </div>


            {/* CHILDREN */}

            {hasChildren && (

              <AdminMenuTree
                menus={menus}
                parentId={menu._id}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                onAddChild={onAddChild}
              />

            )}

          </div>
        );

      })}

    </div>
  );
}