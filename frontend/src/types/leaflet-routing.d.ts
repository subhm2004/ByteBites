import "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: Record<string, unknown>): L.Control;
    function osrmv1(options?: Record<string, unknown>): unknown;
  }
}
