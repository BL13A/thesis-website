import {
  apiRequest,
  getInventoryApiUrl,
  getStockMovementsApiUrl,
  getTilesApiUrl,
} from '@/services/apiClient';
import { mapApiTile } from '@/utils/apiMappers';
import type { InventoryItem, StockMovement, TileProduct } from '@/types';

export async function fetchInventory(filters?: Record<string, string>): Promise<{
  items: InventoryItem[];
  available: boolean;
}> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.tileType) params.set('tileType', filters.tileType);
  if (filters?.status) params.set('status', filters.status);

  const query = params.toString();
  const result = await apiRequest<{ success: boolean; tiles: TileProduct[] }>(
    `${getTilesApiUrl('')}${query ? `?${query}` : ''}`,
    { auth: true },
  );
  return { items: result.tiles.map(mapApiTile), available: true };
}

export async function fetchLowStockTiles(): Promise<InventoryItem[]> {
  const result = await apiRequest<{ success: boolean; tiles: TileProduct[] }>(
    getInventoryApiUrl('/low-stock'),
    { auth: true },
  );
  return result.tiles.map(mapApiTile);
}

export async function createTile(payload: Partial<TileProduct>): Promise<TileProduct> {
  const result = await apiRequest<{ success: boolean; tile: TileProduct }>(getTilesApiUrl(''), {
    method: 'POST',
    body: payload,
    auth: true,
  });
  return result.tile;
}

export async function updateTile(tileId: string, payload: Partial<TileProduct>): Promise<TileProduct> {
  const result = await apiRequest<{ success: boolean; tile: TileProduct }>(
    getTilesApiUrl(`/${tileId}`),
    { method: 'PUT', body: payload, auth: true },
  );
  return result.tile;
}

export async function deleteTile(tileId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(getTilesApiUrl(`/${tileId}`), {
    method: 'DELETE',
    auth: true,
  });
}

export async function fetchTileHistory(tileId: string): Promise<StockMovement[]> {
  const result = await apiRequest<{ success: boolean; stockHistory: StockMovement[] }>(
    getTilesApiUrl(`/${tileId}`),
    { auth: true },
  );
  return result.stockHistory;
}

export async function recordStockMovement(payload: {
  tileId: string;
  transactionType: 'In' | 'Out';
  quantity: number;
  reason: string;
  transactionDate: string;
}): Promise<{ movement: StockMovement; tile: TileProduct }> {
  const result = await apiRequest<{
    success: boolean;
    movement: StockMovement;
    tile: TileProduct;
  }>(getStockMovementsApiUrl(''), {
    method: 'POST',
    body: payload,
    auth: true,
  });
  return { movement: result.movement, tile: result.tile };
}
