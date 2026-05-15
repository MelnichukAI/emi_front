import { Redirect } from "expo-router";

/** Вкладка «Справочники» по умолчанию открывает компас (явный маршрут /compass). */
export default function ReferenceTabIndex() {
  return <Redirect href="/client/reference/compass" />;
}
