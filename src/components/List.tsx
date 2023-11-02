/** @format */

type ListProps = {
  records: {
    id: string;
    amount: number;
    detail: string;
  }[];
  onDelete: (id: string) => void; // 使用字符串 ID 作為參數
};

function List({ records, onDelete }: ListProps) {
  return (
    <ul>
      {records.map((record) => (
        <li
          key={record.id}
          className="text-purple-400 flex justify-between mb-1"
        >
          💲 {record.amount} 📒 {record.detail}
          <button
            className="text-pink-400 p-1 border border-pink-400 rounded hover:bg-pink-100"
            onClick={() => onDelete(record.id)} // 使用 record.id 而不是索引值
          >
            刪除
          </button>
        </li>
      ))}
    </ul>
  );
}

export default List;
