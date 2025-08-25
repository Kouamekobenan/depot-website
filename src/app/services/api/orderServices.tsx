import api from "../../prisma/api";
import {
  OrderDto,
  OrderPaginationResponse,
  OrderFilters,
} from "../../types/api/order.types";

interface ParamItem {
  limit: number;
  page: number;
  search?: string;
  status?: string;
}
export class OrderService {
  private static readonly ENDPOINT = "/order";

  /**
   * Récupère les commandes paginées avec filtres
   */
  static async getPaginated(
    tenantId: string,
    filters: OrderFilters = {}
  ): Promise<OrderPaginationResponse> {
    const { page = 1, limit = 10, search, status } = filters;

    // Construire les paramètres dynamiquement
    const params: ParamItem = { page, limit };

    if (search?.trim()) {
      params.search = search.trim();
    }

    if (status && status !== "ALL") {
      params.status = status;
    }

    try {
      const response = await api.get<OrderPaginationResponse>(
        `${this.ENDPOINT}/paginate/${tenantId}`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      throw new Error("Impossible de charger les commandes");
    }
  }

  /**
   * Récupère une commande par ID
   */
  static async getById(orderId: string): Promise<OrderDto> {
    try {
      const response = await api.get<OrderDto>(`${this.ENDPOINT}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
      throw new Error("Impossible de charger la commande");
    }
  }

  /**
   * Met à jour le statut d'une commande
   */
  static async updateStatus(
    orderId: string,
    status: string
  ): Promise<OrderDto> {
    try {
      const response = await api.patch<OrderDto>(
        `${this.ENDPOINT}/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw new Error("Impossible de mettre à jour le statut");
    }
  }

  /**
   * Crée une nouvelle commande
   */
  static async create(orderData: Omit<OrderDto, "id">): Promise<OrderDto> {
    try {
      const response = await api.post<OrderDto>(this.ENDPOINT, orderData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      throw new Error("Impossible de créer la commande");
    }
  }

  /**
   * Supprime une commande
   */
  static async delete(orderId: string): Promise<void> {
    try {
      await api.delete(`${this.ENDPOINT}/${orderId}`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      throw new Error("Impossible de supprimer la commande");
    }
  }

  /**
   * Annule une commande
   */
  static async cancel(orderId: string): Promise<OrderDto> {
    return this.updateStatus(orderId, "CANCELED");
  }

  /**
   * Confirme une commande
   */
  static async confirm(orderId: string): Promise<OrderDto> {
    return this.updateStatus(orderId, "COMPLETED");
  }
}
