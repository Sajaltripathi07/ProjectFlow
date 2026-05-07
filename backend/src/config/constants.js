module.exports = {
  ROLES: {
    ADMIN: "admin",
    MEMBER: "member",
  },

  TASK_STATUS: {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
  },

  TASK_PRIORITY: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER: 500,
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
