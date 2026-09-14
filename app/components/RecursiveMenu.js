import MenuItem from "./MenuItem";

export default function RecursiveMenu({
  menus = [],
  parentId = null,
  level = 0,
  mobile = false,
  onNavigate,
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

  return (
    <>
      {children.map((menu) => (
        <MenuItem
          key={String(menu._id)}
          menu={menu}
          menus={menus}
          level={level}
          mobile={mobile}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}