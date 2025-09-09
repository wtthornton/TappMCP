/**
 * Template Engine Core Functionality
 *
 * Contains the main template engine logic without the large ContextAwareTemplateEngine class
 */
import Handlebars from 'handlebars';
/**
 * Base Template Engine
 */
export class BaseTemplateEngine {
    templates = new Map();
    sessionMemory = new Map();
    userProfiles = new Map();
    constructor() {
        this.initializeHandlebarsHelpers();
    }
    /**
     * Initialize Handlebars helpers
     */
    initializeHandlebarsHelpers() {
        // Equality helper
        Handlebars.registerHelper('if_eq', (a, b, options) => {
            if (a === b) {
                return options.fn(options.data.root);
            }
            return options.inverse(options.data.root);
        });
        // Conditional helper
        Handlebars.registerHelper('if_contains', (array, value, options) => {
            if (Array.isArray(array) && array.includes(value)) {
                return options.fn(options.data.root);
            }
            return options.inverse(options.data.root);
        });
        // User level helper
        Handlebars.registerHelper('user_level', (level, options) => {
            const context = options.data.root;
            if (context.userLevel === level) {
                return options.fn(options.data.root);
            }
            return options.inverse(options.data.root);
        });
        // Task type helper
        Handlebars.registerHelper('task_type', (type, options) => {
            const context = options.data.root;
            if (context.taskType === type) {
                return options.fn(options.data.root);
            }
            return options.inverse(options.data.root);
        });
        // Array length helper
        Handlebars.registerHelper('array_length', (array) => {
            if (Array.isArray(array)) {
                return array.length;
            }
            return 0;
        });
    }
    /**
     * Add a custom template
     */
    addCustomTemplate(templateData) {
        this.templates.set(templateData.id, templateData);
    }
    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId) || null;
    }
    /**
     * Generate template with context
     */
    generateTemplate(templateId, context) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        const compiledTemplate = Handlebars.compile(template.template);
        return compiledTemplate(context);
    }
    /**
     * Get session context
     */
    getSessionContext(sessionId) {
        return this.sessionMemory.get(sessionId) || null;
    }
    /**
     * Update session context
     */
    updateSessionContext(sessionId, updates) {
        const existing = this.getSessionContext(sessionId);
        if (existing) {
            this.sessionMemory.set(sessionId, { ...existing, ...updates });
        }
    }
    /**
     * Get user profile
     */
    getUserProfile(userId) {
        return this.userProfiles.get(userId) || null;
    }
    /**
     * Update user profile
     */
    updateUserProfile(userId, updates) {
        const existing = this.getUserProfile(userId);
        if (existing) {
            this.userProfiles.set(userId, { ...existing, ...updates });
        }
    }
}
//# sourceMappingURL=template-engine-core.js.map