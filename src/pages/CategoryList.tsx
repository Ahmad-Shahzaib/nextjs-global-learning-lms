
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchCategories } from "@/store/redux/thunks/categoriesThunk";
import CommonTable, { ColumnDef } from "@/components/common/CommonTable";

const columns: ColumnDef<any>[] = [
  {
    header: "ID",
    accessor: "id",
  },
  {
    header: "Slug",
    accessor: "slug",
  },
  {
    header: "Title",
    accessor: (row) => row.translations?.[0]?.title || "—",
  },
  {
    header: "Icon",
    accessor: (row) => {
      let iconUrl = row.icon;
      if (iconUrl && !iconUrl.startsWith("http")) {
        // Use Vite env variable for base API URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        iconUrl = `${baseUrl}${iconUrl}`;
      }
      return row.icon ? (
        <div className="flex justify-center">
          <img
            src={iconUrl}
            alt="icon"
            className="w-10 h-10 object-contain rounded shadow border"
            style={{ background: '#fff' }}
          />
        </div>
      ) : "—";
    },
    className: "text-center",
  },
  {
    header: "Order",
    accessor: "order",
  },
];

const CategoryList = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Categories</h2>
      <CommonTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage={error || "No categories found."}
        rowKey={(row) => row.id}
      />
    </div>
  );
};

export default CategoryList;