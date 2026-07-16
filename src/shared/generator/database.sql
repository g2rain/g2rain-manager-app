-- g2rain-manager-app 代码生成器参考表结构
-- 核心表来源: g2rain-basis/scripts/g2rain-basis.sql（同步至 2026-05）
-- infra 表来源: g2rain-deploy/config/mysql/g2rain-infra.sql
-- route_definition 为 manager 经网关访问 infra 的网关路由配置（保留历史定义）

-- =============================================
-- g2rain_basis 核心表
-- =============================================

CREATE TABLE `passport` (
  `id` bigint NOT NULL COMMENT '账号标识',
  `username` varchar(64) NOT NULL COMMENT '登录用户',
  `password` varchar(256) NOT NULL DEFAULT '' COMMENT '登录密码',
  `real_name` varchar(128) DEFAULT NULL COMMENT '真实姓名',
  `sex` varchar(12) DEFAULT NULL COMMENT '性别[MALE:男性, FEMALE:女性]',
  `birthday` varchar(16) DEFAULT NULL COMMENT '生日',
  `id_no` varchar(32) DEFAULT NULL COMMENT '身份证号',
  `mobile` varchar(32) DEFAULT '' COMMENT '手机号码',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱地址',
  `status` varchar(32) NOT NULL DEFAULT 'NORMAL' COMMENT '状态[NORMAL:正常, FROZEN:冻结]',
  `password_trusted` tinyint NOT NULL DEFAULT '1' COMMENT '密码是否可信[0:不可信/临时密码, 1:可信/用户已设置]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账号表';

CREATE TABLE `passport_idp_binding` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `passport_id` bigint NOT NULL COMMENT '账号标识，关联 passport.id',
  `idp_type` varchar(32) NOT NULL COMMENT '身份源类型[DINGTALK|FEISHU|WECHAT_WORK等]',
  `idp_subject` varchar(128) NOT NULL COMMENT 'IdP 侧稳定主体标识，建议存钉钉 unionId',
  `corp_id` varchar(64) DEFAULT NULL COMMENT '钉钉企业 corpId',
  `idp_user_id` varchar(128) DEFAULT NULL COMMENT '第三方用户ID，可选',
  `idp_application_code` varchar(128) NOT NULL DEFAULT '' COMMENT '三方应用在 IdP 侧的应用标识',
  `bind_mode` varchar(32) DEFAULT NULL COMMENT '接入形态[INTERNAL|THIRD_PARTY]',
  `raw_profile` json DEFAULT NULL COMMENT 'IdP 返回的原始用户信息快照',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_idp_type_subject_app` (`idp_type`, `idp_subject`, `idp_application_code`),
  KEY `idx_passport_id` (`passport_id`),
  KEY `idx_corp_idp` (`corp_id`, `idp_type`),
  KEY `idx_delete_flag` (`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账号与外部身份源绑定表';

CREATE TABLE `application_idp_provision` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `application_id` bigint NOT NULL COMMENT '应用ID',
  `idp_type` varchar(32) NOT NULL COMMENT '身份源类型',
  `idp_application_code` varchar(128) NOT NULL COMMENT 'IDP侧应用ID',
  `remark` varchar(512) DEFAULT NULL COMMENT '备注',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_idp_application` (`idp_type`, `idp_application_code`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_delete_flag` (`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外部身份源应用与平台应用的绑定';

CREATE TABLE `user` (
  `id` bigint NOT NULL COMMENT '用户标识',
  `passport_id` bigint NOT NULL COMMENT '账号标识',
  `organ_id` bigint NOT NULL COMMENT '机构标识',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱地址',
  `mobile` varchar(32) DEFAULT '' COMMENT '手机号码',
  `real_name` varchar(128) DEFAULT NULL COMMENT '真实姓名',
  `admin` tinyint NOT NULL DEFAULT '0' COMMENT '管理员标记[0:否, 1:是]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_passport_id` (`passport_id`),
  KEY `idx_organ_id` (`organ_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE `organ` (
  `id` bigint NOT NULL COMMENT '机构标识',
  `organ_name` varchar(128) NOT NULL COMMENT '机构名称',
  `organ_type` varchar(32) NOT NULL COMMENT '机构类型[服务商、渠道、公司、租户]',
  `status` varchar(32) NOT NULL DEFAULT 'ACTIVE' COMMENT '机构状态[ACTIVE:有效, INACTIVE:无效]',
  `admin` tinyint NOT NULL DEFAULT '0' COMMENT '运营标记[0:否, 1:是]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_organ_name` (`organ_name`),
  KEY `idx_organ_type` (`organ_type`),
  KEY `idx_organ_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构表';

CREATE TABLE `idp_enterprise_organ` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `idp_type` varchar(32) NOT NULL COMMENT '身份源类型',
  `enterprise_id` varchar(64) NOT NULL COMMENT '外部企业/租户标识',
  `bind_mode` varchar(32) NOT NULL DEFAULT 'INTERNAL' COMMENT '接入形态[IdpBindMode: INTERNAL|THIRD_PARTY]',
  `organ_id` bigint NOT NULL COMMENT '机构标识，关联 organ.id',
  `status` varchar(32) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态[ACTIVE:有效, INACTIVE:停用]',
  `remark` varchar(512) DEFAULT NULL COMMENT '备注',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_idp_enterprise_organ` (`idp_type`, `enterprise_id`, `organ_id`),
  KEY `idx_organ_id` (`organ_id`),
  KEY `idx_idp_enterprise` (`idp_type`, `enterprise_id`),
  KEY `idx_delete_flag` (`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外部企业/租户与平台机构关联表';

CREATE TABLE `organ_closure` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `ancestor_id` bigint NOT NULL COMMENT '祖先机构标识[上级]',
  `descendant_id` bigint NOT NULL COMMENT '后代机构标识[下级]',
  `descendant_type` varchar(32) NOT NULL COMMENT '后代机构类型',
  `relation_type` varchar(32) NOT NULL COMMENT '关系类型[SELF_ASSOCIATION, DIRECT_SUBORDINATE, INDIRECT_SUBORDINATE]',
  `path_count` int NOT NULL DEFAULT '1' COMMENT '路径引用次数',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_ancestor_id` (`ancestor_id`),
  KEY `idx_descendant_id` (`descendant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构路径关系表';

CREATE TABLE `resource_menu` (
  `id` bigint NOT NULL COMMENT '菜单标识',
  `parent_id` bigint DEFAULT NULL COMMENT '父菜单标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `menu_name` varchar(128) NOT NULL COMMENT '菜单名称',
  `menu_code` varchar(64) NOT NULL COMMENT '菜单编码',
  `link_path` varchar(128) DEFAULT NULL COMMENT '链接路径',
  `icon` varchar(32) DEFAULT NULL COMMENT '展示图标',
  `menu_sort_order` int NOT NULL DEFAULT '0' COMMENT '菜单排序',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_app_del_id` (`application_id`, `delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用资源菜单表';

CREATE TABLE `resource_page` (
  `id` bigint NOT NULL COMMENT '页面标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `page_name` varchar(128) NOT NULL COMMENT '页面名称',
  `page_code` varchar(128) NOT NULL COMMENT '页面编码',
  `link_path` varchar(128) NOT NULL COMMENT '链接路径',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_app_del_id` (`application_id`, `delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用资源页面表';

CREATE TABLE `resource_page_element` (
  `id` bigint NOT NULL COMMENT '页面元素标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `page_code` varchar(128) NOT NULL COMMENT '页面编码',
  `page_element_name` varchar(128) NOT NULL COMMENT '页面元素名称',
  `page_element_code` varchar(64) NOT NULL COMMENT '页面元素编码',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_app_del_id` (`application_id`, `delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用资源页面元素表';

CREATE TABLE `service_registry` (
  `id` bigint NOT NULL COMMENT '后端服务标识',
  `service_code` varchar(64) NOT NULL COMMENT '服务逻辑编码',
  `name` varchar(128) NOT NULL COMMENT '服务显示名称',
  `endpoint` varchar(256) NOT NULL COMMENT '服务目标地址',
  `route_prefix` varchar(128) NOT NULL COMMENT '网关路由前缀',
  `description` varchar(512) DEFAULT NULL COMMENT '后端服务说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_code` (`service_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务注册表';

CREATE TABLE `resource_api` (
  `id` bigint NOT NULL COMMENT '资源接口标识',
  `service_code` varchar(64) NOT NULL COMMENT '服务逻辑编码',
  `api_tags` varchar(128) NOT NULL COMMENT '资源接口标签',
  `name` varchar(128) NOT NULL COMMENT '资源接口名称',
  `method` varchar(32) NOT NULL COMMENT '接口请求方法',
  `path` varchar(512) NOT NULL COMMENT '接口请求路径',
  `description` varchar(512) DEFAULT NULL COMMENT '资源接口说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_method_path` (`service_code`, `method`, `path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源接口表';

CREATE TABLE `control_unit` (
  `id` bigint NOT NULL COMMENT '控制单元标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `control_unit_name` varchar(128) NOT NULL COMMENT '控制单元名称',
  `control_unit_scope` varchar(32) NOT NULL COMMENT '控制单元类型[OPERATION, CUSTOMER, PERPETUAL]',
  `landing` tinyint NOT NULL DEFAULT '0' COMMENT '默认数据[0:否, 1:是]',
  `status` varchar(32) NOT NULL DEFAULT 'UNPUBLISHED' COMMENT '控制单元状态[PUBLISHED, UNPUBLISHED]',
  `description` varchar(512) DEFAULT NULL COMMENT '业务说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='控制单元表';

CREATE TABLE `control_unit_resource_relation` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `control_unit_id` bigint NOT NULL COMMENT '控制单元标识',
  `resource_id` bigint NOT NULL COMMENT '资源标识',
  `resource_type` varchar(32) NOT NULL COMMENT '资源类型[MENU, PAGE, PAGE_ELEMENT, API_ENDPOINT]',
  `status` varchar(32) DEFAULT NULL COMMENT '激活状态[VISIBLE, ENABLED]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_cu_type_del_res` (`control_unit_id`, `resource_type`, `delete_flag`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='控制单元资源关联表';

CREATE TABLE `role` (
  `id` bigint NOT NULL COMMENT '角色标识',
  `organ_id` bigint DEFAULT NULL COMMENT '机构标识',
  `role_name` varchar(128) NOT NULL COMMENT '角色名称',
  `role_type` varchar(32) NOT NULL COMMENT '角色类型[ADMIN, USER]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_organ_id_id` (`organ_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

CREATE TABLE `user_role_relation` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `user_id` bigint NOT NULL COMMENT '用户标识',
  `role_id` bigint NOT NULL COMMENT '角色标识',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_user_role_del` (`user_id`, `role_id`, `delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

CREATE TABLE `role_control_unit_relation` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `role_id` bigint NOT NULL COMMENT '角色标识',
  `control_unit_id` bigint NOT NULL COMMENT '控制单元标识',
  `application_authorization_id` bigint DEFAULT NULL COMMENT '应用授权标识',
  `status` varchar(32) NOT NULL DEFAULT 'ACTIVATED' COMMENT '控制单元状态[ACTIVATED, DEACTIVATED]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_role_sts_del_cu` (`role_id`, `status`, `delete_flag`, `control_unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色控制单元关联表';

CREATE TABLE `control_domain` (
  `id` bigint NOT NULL COMMENT '控制域标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `control_domain_name` varchar(128) NOT NULL COMMENT '控制域名称',
  `control_domain_type` varchar(32) NOT NULL COMMENT '控制域类型[TRADE, APPLICATION]',
  `control_domain_scope` varchar(32) NOT NULL COMMENT '交付范围[CUSTOMER, OPERATION]',
  `description` text COMMENT '业务说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='控制域表';

CREATE TABLE `control_domain_control_unit_relation` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `control_domain_id` bigint NOT NULL COMMENT '控制域标识',
  `control_unit_id` bigint NOT NULL COMMENT '控制单元标识',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_control_domain_unit` (`control_domain_id`, `control_unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='控制域控制单元关联表';

CREATE TABLE `application` (
  `id` bigint NOT NULL COMMENT '应用标识',
  `organ_id` bigint NOT NULL COMMENT '机构标识',
  `application_name` varchar(128) NOT NULL COMMENT '应用名称',
  `application_code` varchar(64) DEFAULT NULL COMMENT '应用编码',
  `can_integrate` tinyint NOT NULL DEFAULT '0' COMMENT '是否具备集成功能[0:否, 1:是]',
  `landing` tinyint NOT NULL DEFAULT '0' COMMENT '默认数据[0:否, 1:是]',
  `api_key_supported` tinyint NOT NULL DEFAULT '0' COMMENT '支持API密钥[0:否, 1:是]',
  `application_type` varchar(32) NOT NULL COMMENT '应用类型[SUPPORT, SYSTEM, PUBLIC, PRIVATE]',
  `public_key_algorithm` varchar(32) DEFAULT NULL COMMENT '应用公钥算法',
  `public_key_format` varchar(32) DEFAULT NULL COMMENT '应用公钥格式',
  `public_key` text COMMENT '应用公钥内容',
  `access_token_expires_in` int NOT NULL COMMENT '访问令牌生存时间(秒)',
  `refresh_token_expires_in` int NOT NULL COMMENT '刷新访问令牌生存时间(秒)',
  `endpoint_url` varchar(512) NOT NULL COMMENT '访问地址',
  `context_path` varchar(512) DEFAULT NULL COMMENT '应用路径',
  `status` varchar(32) NOT NULL DEFAULT 'UNPUBLISHED' COMMENT '应用状态[PUBLISHED, UNPUBLISHED]',
  `description` varchar(512) DEFAULT NULL COMMENT '业务说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用表';

CREATE TABLE `application_suite` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `master_application_id` bigint NOT NULL COMMENT '主应用标识',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用归类关系表';

CREATE TABLE `application_authorization` (
  `id` bigint NOT NULL COMMENT '应用授权标识',
  `organ_id` bigint NOT NULL COMMENT '机构标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `control_domain_id` bigint NOT NULL COMMENT '控制域标识',
  `subscription_id` bigint DEFAULT NULL COMMENT '订阅标识',
  `status` varchar(32) NOT NULL DEFAULT 'ACTIVATED' COMMENT '应用授权状态[ACTIVATED, DEACTIVATED]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_control_domain_id` (`control_domain_id`),
  KEY `idx_organ_st_del_app` (`organ_id`, `status`, `delete_flag`, `application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用授权记录表';

CREATE TABLE `personal_static_access_token` (
  `id` bigint NOT NULL COMMENT '个人静态访问令牌标识',
  `application_authorization_id` bigint DEFAULT NULL COMMENT '授权记录标识',
  `application_id` bigint NOT NULL COMMENT '应用标识',
  `organ_id` bigint NOT NULL COMMENT '机构标识',
  `user_id` bigint DEFAULT NULL COMMENT '用户标识',
  `name` varchar(128) NOT NULL COMMENT '访问令牌名称',
  `token_hash` varchar(64) NOT NULL COMMENT '静态访问令牌的哈希摘要',
  `masked_token` varchar(28) NOT NULL COMMENT '脱敏令牌',
  `status` varchar(32) NOT NULL DEFAULT 'ACTIVATED' COMMENT '状态[ACTIVATED, REVOKED]',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_hash` (`token_hash`),
  KEY `idx_authorization_org_del` (`application_authorization_id`, `organ_id`, `delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人静态访问令牌表';

CREATE TABLE `login_token` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `session_type` varchar(32) DEFAULT NULL COMMENT '会话类型',
  `organ_id` bigint DEFAULT NULL COMMENT '机构标识',
  `organ_type` varchar(32) DEFAULT NULL COMMENT '机构类型',
  `admin_company` tinyint NOT NULL DEFAULT '0' COMMENT '运营标记[0:否, 1:是]',
  `passport_id` bigint DEFAULT NULL COMMENT '账号标识',
  `user_id` bigint DEFAULT NULL COMMENT '用户标识',
  `real_name` varchar(128) DEFAULT NULL COMMENT '真实姓名',
  `admin_user` tinyint NOT NULL DEFAULT '0' COMMENT '管理员标记[0:否, 1:是]',
  `application_id` bigint DEFAULT NULL COMMENT '应用标识',
  `application_organ_id` bigint DEFAULT NULL COMMENT '应用组织标识',
  `client_id` varchar(64) DEFAULT NULL COMMENT '客户端ID',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录信息表';

CREATE TABLE `audit_event` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `trace_id` varchar(64) DEFAULT NULL COMMENT '网关跟踪标识',
  `client_id` varchar(128) DEFAULT NULL COMMENT '客户端标识',
  `request_id` varchar(64) DEFAULT NULL COMMENT '前端请求标识',
  `request_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '前端请求时间',
  `accept_language` varchar(32) DEFAULT NULL COMMENT '语言偏好',
  `path` varchar(512) DEFAULT NULL COMMENT '请求路径',
  `method` varchar(32) DEFAULT NULL COMMENT '请求方法',
  `user_agent` varchar(512) DEFAULT NULL COMMENT '客户端标识',
  `host` varchar(255) DEFAULT NULL COMMENT '请求主机',
  `x_forwarded_for` varchar(1024) DEFAULT NULL COMMENT '代理链IP列表',
  `x_real_ip` varchar(64) DEFAULT NULL COMMENT '真实客户端IP',
  `referer` varchar(2048) DEFAULT NULL COMMENT '请求来源URL',
  `session_type` varchar(32) DEFAULT NULL COMMENT '会话类型',
  `passport_id` bigint DEFAULT NULL COMMENT '账号标识',
  `user_id` bigint DEFAULT NULL COMMENT '用户标识',
  `name` varchar(128) DEFAULT NULL COMMENT '真实姓名',
  `admin_user` tinyint DEFAULT '0' COMMENT '超级管理员',
  `organ_id` bigint DEFAULT NULL COMMENT '组织标识',
  `organ_name` varchar(255) DEFAULT NULL COMMENT '组织名称',
  `organ_type` varchar(32) DEFAULT NULL COMMENT '组织类型',
  `admin_company` tinyint DEFAULT '0' COMMENT '平台运营组织',
  `target_organ_id` bigint DEFAULT NULL COMMENT '数据操作的目标组织标识',
  `application_id` bigint DEFAULT NULL COMMENT '请求来源应用标识',
  `application_code` varchar(64) DEFAULT NULL COMMENT '请求来源应用编码',
  `application_organ_id` bigint DEFAULT NULL COMMENT '请求来源应用所属机构标识',
  `payload` json DEFAULT NULL COMMENT '请求/响应摘要',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_passport_id` (`passport_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_organ_id` (`organ_id`),
  KEY `idx_application_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计事件表';

-- =============================================
-- g2rain_infra 相关表（manager 经网关访问 infra 服务）
-- =============================================

CREATE TABLE `dictionary_usage` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `usage_code` varchar(64) NOT NULL COMMENT '字典用途代码',
  `usage_name` varchar(64) NOT NULL COMMENT '字典用途名称',
  `description` varchar(512) DEFAULT NULL COMMENT '业务描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典用途表';

CREATE TABLE `dictionary_item` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `parent_id` bigint DEFAULT NULL COMMENT '父节点ID,用于 tree 结构字典',
  `usage_code` varchar(64) NOT NULL COMMENT '字典用途代码',
  `code` varchar(64) NOT NULL COMMENT '字典项编码,用于系统标识',
  `name` varchar(128) NOT NULL COMMENT '字典名称(默认语言)',
  `description` varchar(512) DEFAULT NULL COMMENT '业务描述',
  `sort_index` int DEFAULT NULL COMMENT '字典排序',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典明细表';

CREATE TABLE `locale_setting` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `language_code` varchar(32) NOT NULL COMMENT '语言编码,如 zh',
  `region_code` varchar(32) NOT NULL COMMENT '国家/地区编码,如 CN',
  `code` varchar(64) NOT NULL COMMENT '区域标识,如 zh-CN',
  `name` varchar(64) NOT NULL COMMENT '区域名称,如 中国-简体中文',
  `description` varchar(255) DEFAULT NULL COMMENT '语言描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地域-语言设置表';

CREATE TABLE `i18n_message` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `message_usage_code` varchar(64) NOT NULL COMMENT '消息用途代码',
  `language_code` varchar(32) NOT NULL COMMENT '语言编码,如 zh',
  `region_code` varchar(32) DEFAULT NULL COMMENT '国家/地区编码,如 CN',
  `message_code` varchar(128) NOT NULL COMMENT '国际化消息编码(唯一)',
  `message_text` text NOT NULL COMMENT '国际化内容文本',
  `extend_field` json DEFAULT NULL COMMENT '扩展字段,存储额外格式化内容',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='国际化信息表';

CREATE TABLE `g2rain_raindrop` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键标识',
  `biz_tag` varchar(128) NOT NULL COMMENT '业务标识,每个业务对应一行',
  `max_id` bigint NOT NULL DEFAULT '1' COMMENT '当前分配到的最大ID',
  `step` int NOT NULL DEFAULT '0' COMMENT '分配步长,用于批量预分配ID',
  `description` varchar(256) DEFAULT '' COMMENT '业务描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_biz_tag` (`biz_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全局唯一ID管理表';

CREATE TABLE `route_definition` (
  `id` bigint NOT NULL COMMENT '路由标识',
  `name` varchar(128) NOT NULL COMMENT '路由名称',
  `endpoint_host` varchar(256) NOT NULL COMMENT '终端主机',
  `endpoint_path` varchar(256) DEFAULT NULL COMMENT '终端路径',
  `context` varchar(128) NOT NULL COMMENT '转发路径',
  `path` varchar(256) NOT NULL COMMENT '请求路径',
  `method` varchar(32) DEFAULT NULL COMMENT '请求方法',
  `header_parameters` varchar(512) DEFAULT NULL COMMENT '请求头参',
  `content_type` varchar(64) DEFAULT NULL COMMENT '内容类型',
  `description` varchar(512) DEFAULT NULL COMMENT '业务说明',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网关路由表';
