import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import {
  getCityAggregates,
  getCuisineAggregates,
  getRestaurants,
  getStateAggregates,
} from "@/lib/data/restaurants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/explore",
    "/map",
    "/about-michelin-stars",
    "/passport",
    "/saved",
    "/visited",
    "/collections",
    "/stars/1",
    "/stars/2",
    "/stars/3",
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const restaurants = getRestaurants().map((restaurant) => ({
    url: absoluteUrl(`/restaurants/${restaurant.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const states = getStateAggregates().map((state) => ({
    url: absoluteUrl(`/usa/${state.stateSlug}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const cities = getCityAggregates().map((city) => ({
    url: absoluteUrl(`/cities/${city.citySlug}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const cuisines = getCuisineAggregates().map((cuisine) => ({
    url: absoluteUrl(`/cuisines/${cuisine.cuisineSlug}`),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...restaurants, ...states, ...cities, ...cuisines];
}
