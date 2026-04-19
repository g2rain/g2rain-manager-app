CREATE TABLE `g2rain_raindrop` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键标识',
  `biz_tag` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '业务标识,每个业务对应一行',
  `max_id` bigint NOT NULL DEFAULT '1' COMMENT '当前分配到的最大ID',
  `step` int NOT NULL DEFAULT '0' COMMENT '分配步长,用于批量预分配ID',
  `description` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '业务描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_biz_tag` (`biz_tag`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全局唯一ID管理表';
CREATE TABLE `dictionary_item` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `parent_id` bigint DEFAULT NULL COMMENT '父节点ID,用于 tree 结构字典',
  `dictionary_usage_id` bigint NOT NULL COMMENT '字典用途主键标识',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典项编码,用于系统标识',
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典名称(默认语言)',
  `description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '业务描述',
  `sort_index` int DEFAULT NULL COMMENT '字典排序',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典明细表';
CREATE TABLE `dictionary_usage` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `usage_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典用途代码',
  `usage_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典用途名称',
  `description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '业务描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典用途表';
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='网关路由表';
CREATE TABLE `locale_setting` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `language_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语言编码,如 zh',
  `region_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '国家/地区编码,如 CN',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区域标识,如 zh-CN',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区域名称,如 中国-简体中文',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '语言描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地域-语言设置表';
CREATE TABLE `i18n_message_usage` (
  `id` bigint NOT NULL COMMENT '主键标识',
  `usage_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用途编码,用于在代码中标识用途:DICTIONARY 字典, ERROR_CODE 错误码为固定用途',
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用途名称',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '业务描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='国际化信息用途表';
CREATE TABLE `i18n_message` (
    `id` bigint NOT NULL COMMENT '主键标识',
    `message_usage_id` bigint NOT NULL COMMENT '用途标识',
    `language_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语言编码,如 zh',
    `region_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '国家/地区编码,如 CN',
    `message_code` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '国际化消息编码(唯一)',
    `message_text` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '国际化内容文本',
    `extend_field` json DEFAULT NULL COMMENT '扩展字段,存储额外格式化内容',
    `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='国际化信息表';