import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../api/categories";
import { toast } from "sonner";

/**
 * Custom React Query hook for fetching all categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

/**
 * Custom React Query mutation hook for creating a category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Category "${variables.name}" created successfully.`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to create category.";
      toast.error(msg);
    },
  });
}

/**
 * Custom React Query mutation hook for updating a category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to update category.";
      toast.error(msg);
    },
  });
}

/**
 * Custom React Query mutation hook for deleting a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to delete category.";
      toast.error(msg);
    },
  });
}
