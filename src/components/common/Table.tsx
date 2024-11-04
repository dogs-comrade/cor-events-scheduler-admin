import { h } from 'preact';

interface Column {
  header: string;
  accessor: string;
  cell?: (value: any) => any;
}

interface Props {
  data: any[];
  columns: Column[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Table = ({ data, columns, currentPage, onPageChange }: Props) => {
  return (
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} class="px-6 py-4 whitespace-nowrap">
                  {column.cell ? 
                    column.cell(row[column.accessor]) : 
                    row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div class="flex justify-between items-center px-6 py-3 border-t">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          class="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};