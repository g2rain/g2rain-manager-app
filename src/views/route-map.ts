/**
 * 视图路由映射工具类
 *
 * 使用说明：
 * 1. 在 views 目录下创建新的 Vue 组件
 * 2. 在此文件中添加对应的路由路径到组件的映射
 * 3. 路由路径格式：/path/to/page（必须以 / 开头）
 * 4. 组件路径使用 @/views/ 别名
 *
 * 示例：
 * '/system/user': () => import('@/views/user/index.vue'),
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * 单条路由配置
 * 使用统一的类型，避免在多个 Map 中重复维护信息
 */
export interface ViewRouteConfig {
  /** 组件加载函数 */
  component: () => Promise<unknown>;
  /** 路由名称（可选） */
  name?: string;
  /** 路由元信息 */
  meta: {
    /** 标题，用于菜单和面包屑展示 */
    title: string;
    /** 是否需要登录权限 */
    requiresAuth: boolean;
    /** 是否在首页展示入口 */
    showInHome?: boolean;
  };
}

/**
 * 路由路径到配置的映射表
 * 键：路由路径（如 '/system/user'）
 * 值：完整的路由配置（包含组件、名称、meta 等）
 */
export const routeMap: Record<string, ViewRouteConfig> = {
  '/passport': {
    component: () => import('@/views/passport/index.vue'),
    name: 'Passport',
    meta: {
      title: 'passport',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/user': {
    component: () => import('@/views/user/index.vue'),
    name: 'User',
    meta: {
      title: 'user',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/organ': {
    component: () => import('@/views/organ/index.vue'),
    name: 'Organ',
    meta: {
      title: 'organ',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/resource_menu': {
    component: () => import('@/views/resource_menu/index.vue'),
    name: 'ResourceMenu',
    meta: {
      title: 'resource_menu',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/resource_page': {
    component: () => import('@/views/resource_page/index.vue'),
    name: 'ResourcePage',
    meta: {
      title: 'resource_page',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/control_unit': {
    component: () => import('@/views/control_unit/index.vue'),
    name: 'ControlUnit',
    meta: {
      title: 'control_unit',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/role': {
    component: () => import('@/views/role/index.vue'),
    name: 'Role',
    meta: {
      title: 'role',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/control_domain': {
    component: () => import('@/views/control_domain/index.vue'),
    name: 'ControlDomain',
    meta: {
      title: 'control_domain',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/application': {
    component: () => import('@/views/application/index.vue'),
    name: 'Application',
    meta: {
      title: 'application',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/application_authorization': {
    component: () => import('@/views/application_authorization/index.vue'),
    name: 'ApplicationAuthorization',
    meta: {
      title: 'application_authorization',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/resource_settings': {
    component: () => import('@/views/resource_settings/index.vue'),
    name: 'ResourceSettings',
    meta: {
      title: 'resource_settings',
      requiresAuth: true,
      showInHome: true,
    },
  },
  '/service_registry': {
    component: () => import('@/views/service_registry/index.vue'),
    name: 'ServiceRegistry',
    meta: {
      title: 'service_registry',
      requiresAuth: true,
      showInHome: true

    },
  },
  '/resource_api': {
    component: () => import('@/views/resource_api/index.vue'),
    name: 'ResourceApi',
    meta: {
      title: 'resource_api',
      requiresAuth: true,
      showInHome: true
    },
  },
  '/login_token': {
    component: () => import('@/views/login_token/index.vue'),
    name: 'LoginToken',
    meta: {
      title: 'login_token',
      requiresAuth: true,
      showInHome: true
    },
  },
  '/audit_event': {
    component: () => import('@/views/audit_event/index.vue'),
    name: 'AuditEvent',
    meta: {
      title: 'audit_event',
      requiresAuth: true,
      showInHome: true
    },
  },
    '/personal_static_access_token': {
            component: () => import('@/views/personal_static_access_token/index.vue'),
            name: 'PersonalStaticAccessToken',
            meta: { title: '个人静态访问令牌', requiresAuth: true, showInHome: true },
        }
};

/**
 * 根据路由映射表生成路由配置数组
 */
export function getRouteConfig(): RouteRecordRaw[] {
  return Object.entries(routeMap).map(([path, config]) => {
    const { component, name, meta } = config;

    return {
      path,
      name,
      component,
      meta,
    } as RouteRecordRaw;
  });
}

/**
 * 根据路由路径获取组件加载函数
 * @param routePath 路由路径（如 '/system/user'）
 * @returns 组件加载函数，如果路径不存在则返回 undefined
 */
export function getRouteComponent(routePath: string): (() => Promise<unknown>) | undefined {
  return routeMap[routePath]?.component;
}

/**
 * 获取所有需要在 Home 页面展示的路由
 * 自动过滤掉 '/' 和 '/home'，只返回标记了 showInHome: true 的路由
 * @returns 需要在 Home 展示的路由配置数组
 */
export function getHomeRoutes(): Array<{ path: string; title: string; name?: string }> {
  return Object.entries(routeMap)
    .filter(([path, config]) => {
      const { meta } = config;
      // 排除根路径和 home 路径
      if (path === '/' || path === '/home') {
        return false;
      }
      // 只返回标记了 showInHome: true 的路由
      return meta.showInHome === true;
    })
    .map(([path, config]) => {
      const { meta, name } = config;
      return {
        path,
        title: meta.title,
        name,
      };
    });
}

