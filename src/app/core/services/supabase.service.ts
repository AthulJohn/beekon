import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../shared/env/environment';
import { Beacon, Flag, FlagType } from '../models/beacon.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,      
      environment.ANON_KEY,
      {
        auth: {
          persistSession: true, // Store the session in localStorage
          autoRefreshToken: false, // Automatically refresh the token
          detectSessionInUrl: true, // Handle OAuth redirects
          storage: localStorage // Use localStorage for session storage
        }
      }
    );
  }

  get client() {
    return this.supabase;
  }

  convertBeaconToStorable(beacon: Beacon): any {
    return {
      id: beacon.id,
      slug: beacon.slug,
      title: beacon.title,
      description: beacon.description,
      brand_url: beacon.brandUrl ?? null,
      created_at: beacon.createdAt.toISOString(),
      updated_at: beacon.updatedAt.toISOString(),
      flags: JSON.stringify(beacon.flags.map(flag => ({
        id: flag.id,
        name: flag.name,
        type: flag.type,
        value: flag.value,
        options: flag.options ?? null
      })))
    };
  }

  fromSupabaseFormat(data: any): Beacon {
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      brandUrl: data.brand_url ?? undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      flags: (JSON.parse(data.flags) as any[]).map((flag): Flag => ({
        id: flag.id,
        name: flag.name,
        type: flag.type as FlagType,
        value: flag.value,
        options: flag.options ?? undefined
      }))
    };
  }

  // Create a beacon
  async createBeacon(beacon: any) {
    console.log(this.convertBeaconToStorable(beacon))
    const { data, error } = await this.client
      .from('beekon-beacons')
      .insert(this.convertBeaconToStorable(beacon));

    if (error) throw error;
    return data;
  }
  // Create a beacon
  async updateBeacon(beacon: any) {
    const { data, error } = await this.client
      .from('beekon-beacons')
      .update(this.convertBeaconToStorable(beacon))
      .filter('id','eq',beacon.id);

    if (error) throw error;
    return data;
  }

  // Get beacon by ID
  async getBeaconById(id: string) {
    const { data, error } = await this.client
      .from('beekon-beacons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.fromSupabaseFormat(data);
  }

  async getBeaconBySlug(slug: string) {
    const { data, error } = await this.client
      .from('beekon-beacons')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return this.fromSupabaseFormat(data);
  }

  // Check if ID or Slug is taken
  async isIdOrSlugTaken(id: string, slug: string): Promise<{ idTaken: boolean; slugTaken: boolean }> {
    const { data: byId } = await this.client
      .from('beekon-beacons')
      .select('id')
      .eq('id', id);

    const { data: bySlug } = await this.client
      .from('beekon-beacons')
      .select('slug')
      .eq('slug', slug);

    return {
      idTaken: !!byId?.length,
      slugTaken: !!bySlug?.length
    };
  }

  // Update flags
  async updateFlags(id: string, flags: any) {
    const { data, error } = await this.supabase
      .from('beekon-beacons')
      .update({ flags })
      .eq('id', id);

    if (error) throw error;
    return data;
  }

}
