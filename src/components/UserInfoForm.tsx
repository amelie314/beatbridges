/** @format */

import React from "react";

const UserInfoForm = ({ user }) => {
  const handleNameChange = (event) => {
    // 更新用户名称的逻辑
  };

  return (
    <form>
      <label>名字:</label>
      <input type="text" value={user.displayName} onChange={handleNameChange} />
      {/* 其他表单元素 */}
      <button type="submit">保存修改</button>
    </form>
  );
};

export default UserInfoForm;
