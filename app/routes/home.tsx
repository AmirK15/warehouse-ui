import type { Route } from "./+types/home";
import WarehouseManagementSystem from "../warehouse/warehouse";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Warehouse App" },
  ];
}

export default function Home() {
  return <WarehouseManagementSystem />;
}
