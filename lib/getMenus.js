import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function getMenus() {

  await connectDB();

  const menus = await Menu.find({
    active: true,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .lean();

  return JSON.parse(JSON.stringify(menus));
}