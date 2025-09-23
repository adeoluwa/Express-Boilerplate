import { AwilixContainer, asClass, asFunction } from "awilix";
import path from "path";
import fs from "fs";

export interface ModuleExports {
  controllers?: Array<{ name: string; factory: () => any }>;
  services?: Array<{ name: string; class: new (...args: any[]) => any }>;
  repositories?: Array<{ name: string; class: new (...args: any[]) => any }>;
}

/**
 * Automatically loads and registers all modules from the modules directory
 * @param container - The Awilix container instance
 * @param modulesPath - Path to the modules directory
 */
export function loadModules(
  container: AwilixContainer,
  modulesPath: string = "src/modules"
) {
  const fullModulesPath = path.resolve(modulesPath);

  if (!fs.existsSync(fullModulesPath)) {
    console.warn(`Modules path does not exist: ${fullModulesPath}`);
    return;
  }

  // Get all module directories
  const moduleDirs = fs
    .readdirSync(fullModulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const moduleName of moduleDirs) {
    const modulePath = path.join(fullModulesPath, moduleName, "index.ts");

    if (fs.existsSync(modulePath)) {
      try {
        // Dynamic import of the module
        const moduleExports = require(modulePath);
        registerModule(container, moduleName, moduleExports);
      } catch (error) {
        console.error(`Failed to load module ${moduleName}:`, error);
      }
    }
  }
}

/**
 * Registers a single module's exports with the container
 * @param container - The Awilix container instance
 * @param moduleName - Name of the module
 * @param exports - Module exports
 */
function registerModule(
  container: AwilixContainer,
  moduleName: string,
  exports: any
) {
  const registrations: Record<string, any> = {};

  // Register services
  Object.keys(exports).forEach((exportName) => {
    const exportValue = exports[exportName];

    // Check if it's a service class (ends with 'Service' and is a constructor)
    if (exportName.endsWith("Service") && typeof exportValue === "function") {
      const serviceName = toCamelCase(exportName);
      registrations[serviceName] = asClass(exportValue).singleton();
    }

    // Check if it's a repository class (ends with 'Repository' and is a constructor)
    else if (
      exportName.endsWith("Repository") &&
      typeof exportValue === "function"
    ) {
      const repositoryName = toCamelCase(exportName);
      registrations[repositoryName] = asClass(exportValue).singleton();
    }

    // Check if it's a controller factory (starts with 'create' and ends with 'Controller')
    else if (
      exportName.startsWith("create") &&
      exportName.endsWith("Controller") &&
      typeof exportValue === "function"
    ) {
      const controllerName = toCamelCase(
        exportName.replace("create", "").replace("Controller", "Controller")
      );
      registrations[controllerName] = asFunction(exportValue).scoped();
    }
  });

  // Register all found items
  if (Object.keys(registrations).length > 0) {
    container.register(registrations);
    console.log(
      `Registered ${
        Object.keys(registrations).length
      } items from module: ${moduleName}`
    );
  }
}

/**
 * Converts a string to camelCase
 * @param str - String to convert
 * @returns camelCase string
 */
function toCamelCase(str: string): string {
  return str.replace(/([A-Z])/g, (match, letter, index) =>
    index === 0 ? letter.toLowerCase() : letter
  );
}

/**
 * Gets all registered controllers from the container
 * @param container - The Awilix container instance
 * @returns Array of controller names
 */
export function getRegisteredControllers(container: AwilixContainer): string[] {
  const registrations = container.registrations;
  return Object.keys(registrations).filter((name) =>
    name.endsWith("Controller")
  );
}

/**
 * Gets all registered services from the container
 * @param container - The Awilix container instance
 * @returns Array of service names
 */
export function getRegisteredServices(container: AwilixContainer): string[] {
  const registrations = container.registrations;
  return Object.keys(registrations).filter((name) => name.endsWith("Service"));
}

/**
 * Gets all registered repositories from the container
 * @param container - The Awilix container instance
 * @returns Array of repository names
 */
export function getRegisteredRepositories(
  container: AwilixContainer
): string[] {
  const registrations = container.registrations;
  return Object.keys(registrations).filter((name) =>
    name.endsWith("Repository")
  );
}
