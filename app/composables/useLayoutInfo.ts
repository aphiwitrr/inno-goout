import type { BreadcrumbItem, MenuItem } from "~/types";

export const useLayoutInfo = () => {
  const route = useRoute();

  const drawer = ref<boolean>(true);
  const isCollapsed = useState("sidebar-collapsed", () => false);

  const rootBreadcrumb = ref<BreadcrumbItem>({
    title: "ระบบบัตรประจำตัวประชาชน",
    disabled: false,
    href: "/",
  });

  const menuItemDefinitions = ref<MenuItem[]>([
    {
      title: "เมนูระบบบัตรประจำตัวประชาชน",
      icon: "mdi-view-grid",
      path: "/menu/idcard",
      external: true,
    },
    {
      title: "หน้าแรก",
      icon: "mdi-card-account-details",
      path: "/",
    },
    {
      title: "ตัวอย่างลายน้ำ - วิธีที่ 1",
      icon: "mdi-image-outline",
      path: "/watermark/preview-1",
    },
    {
      title: "ตัวอย่างลายน้ำ - วิธีที่ 2",
      icon: "mdi-shield-check-outline",
      path: "/watermark/preview-2",
    },
    {
      title: "ตัวอย่างลายน้ำ - วิธีที่ 3",
      icon: "mdi-watermark",
      path: "/watermark/preview-3",
    },
    {
      title: "สรุปเทคนิคการป้องกันลายน้ำ",
      icon: "mdi-format-list-bulleted-type",
      path: "/watermark/summary",
    },
  ]);

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const navigateToRoute = (path: string, external: boolean = false) => {
    navigateTo(path, { external });
  };

  const isActiveRoute = (path: string) => {
    return route.path === path;
  };

  const menuItems = computed(() =>
    menuItemDefinitions.value.map((item: MenuItem) => {
      const resolvedPath = item.external
        ? `${location.origin}${item.path}`
        : item.path;

      return {
        ...item,
        path: resolvedPath,
        active: !item.external && isActiveRoute(item.path),
      };
    }),
  );

  const getBreadcrumbs = computed(() => {

    const currentMenu = menuItemDefinitions.value.find(
      (item: MenuItem) => !item.external && item.path === route.path,
    );

    if (!currentMenu) {
      return [];
    }

    return [
      rootBreadcrumb.value,
      {
        title: currentMenu.title,
        disabled: true,
        href: currentMenu.path,
      },
    ];
  });

  return {
    getBreadcrumbs,
    menuItems,
    drawer,
    isCollapsed,

    toggleCollapse,
    navigateToRoute,
    isActiveRoute,
  };
};
