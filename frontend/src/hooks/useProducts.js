import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct
} from "../api/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Custom React Query hook for paginated product lists.
 * @param {Object} params - Query filters & pagination parameters.
 */
export function useProducts(params) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

/**
 * Custom React Query hook for a single product by ID.
 * @param {string} id - Product ID.
 */
export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

/**
 * Custom React Query mutation hook to create a product.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Product "${data.name}" created successfully.`);
      navigate("/products");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to create product.";
      toast.error(msg);
    },
  });
}

/**
 * Custom React Query mutation hook to update a product.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data._id] });
      toast.success(`Product "${data.name}" updated successfully.`);
      navigate("/products");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to update product.";
      toast.error(msg);
    },
  });
}

/**
 * Custom React Query mutation hook to delete a product.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to delete product.";
      toast.error(msg);
    },
  });
}

/**
 * Custom React Query mutation hook to adjust stock.
 */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => adjustStock(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.product || data._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock quantity adjusted successfully.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to adjust stock quantity.";
      toast.error(msg);
    },
  });
}
