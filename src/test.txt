# Simple field names for sensitive data
fullSSN=fullSSN
phoneNumber=phoneNumber
email=email
creditCardNumber=creditCardNumber
cvv=cvv
bankAccountNumber=bankAccountNumber
routingNumber=routingNumber
dateOfBirth=dateOfBirth
addressLine1=addressLine1
addressLine2=addressLine2
city=city
state=state
zip=zip
businessName=businessName
companyStructure=companyStructure
ipAddress=ipAddress
ipAddressV6=ipAddressV6



public class UnifiedLoggerUtil {
    private static final Set<String> SENSITIVE_FIELDS = loadSensitiveFields();
    private static final Logger log = LoggerFactory.getLogger(UnifiedLoggerUtil.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Loads sensitive field names from the masking.properties file.
     */
    private static Set<String> loadSensitiveFields() {
        Set<String> fields = new HashSet<>();
        Properties properties = new Properties();
        try (InputStream input = 
                UnifiedLoggerUtil.class.getClassLoader().getResourceAsStream("masking.properties")) {
            if (input == null) {
                log.info("Unable to find masking.properties");
                return fields;
            }
            properties.load(input);
            
            properties.forEach((key, value) -> {
                fields.add(key.toString());
                if (!key.equals(value)) {
                    fields.add(value.toString());
                }
            });
        } catch (IOException ex) {
            log.error("Error loading masking.properties: {}", ex.getMessage(), ex);
        }
        return fields;
    }
    
    /**
     * Masks sensitive information in the given text.
     */
    public static String mask(String text) {
        if (!StringUtils.hasLength(text)) {
            return text;
        }
        
        try {
            // Check if the text is JSON
            if (isJsonString(text)) {
                return maskJson(text);
            } else {
                // Handle plain text
                return maskPlainText(text);
            }
        } catch (Exception e) {
            log.error("Error masking text: {}", e.getMessage(), e);
            return text;
        }
    }
    
    /**
     * Determine if string is in JSON format
     */
    private static boolean isJsonString(String text) {
        String trimmed = text.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) || 
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }
    
    /**
     * Masks plain text by finding field keys and masking their values
     */
    private static String maskPlainText(String text) {
        String result = text;
        for (String field : SENSITIVE_FIELDS) {
            // Simple pattern to find "field":"value" or field=value patterns
            String pattern = String.format("(\"%s\"\\s*:\\s*\")(.*?)(\"|%s=)(.*?)($|\\s|,)", 
                field, field);
            result = result.replaceAll(pattern, "$1****$3****$5");
        }
        return result;
    }
    
    /**
     * Masks JSON by parsing and traversing the structure
     */
    private static String maskJson(String jsonString) {
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            JsonNode maskedNode = maskJsonNode(jsonNode);
            return objectMapper.writeValueAsString(maskedNode);
        } catch (Exception e) {
            log.error("Error processing JSON: {}", e.getMessage(), e);
            return jsonString;
        }
    }
    
    /**
     * Recursively masks fields in a JsonNode
     */
    private static JsonNode maskJsonNode(JsonNode node) {
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            Iterator<String> fieldNames = node.fieldNames();
            
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode fieldValue = node.get(fieldName);
                
                if (SENSITIVE_FIELDS.contains(fieldName)) {
                    // Mask sensitive field
                    objectNode.put(fieldName, "****");
                } else if (fieldValue.isObject() || fieldValue.isArray()) {
                    // Recursively process nested structures
                    JsonNode maskedValue = maskJsonNode(fieldValue);
                    objectNode.set(fieldName, maskedValue);
                }
            }
            return objectNode;
        } else if (node.isArray()) {
            ArrayNode arrayNode = (ArrayNode) node;
            for (int i = 0; i < arrayNode.size(); i++) {
                arrayNode.set(i, maskJsonNode(arrayNode.get(i)));
            }
            return arrayNode;
        } else {
            return node;
        }
    }
    
    /**
     * Masks objects by converting to JSON and masking
     */
    public static String maskJson(Object jsonObject) {
        if (jsonObject == null) {
            return null;
        }
        
        try {
            String jsonText = objectMapper.writeValueAsString(jsonObject);
            return mask(jsonText);
        } catch (Exception e) {
            log.error("Error masking object: {}", e.getMessage(), e);
            return String.valueOf(jsonObject);
        }
    }
    
    /**
     * Serializes an object to a JSON string with sensitive data masked
     */
    public static String serializeObjectToString(Object o) {
        if (o == null) {
            return null;
        }
        
        try {
            ObjectMapper mapper = new ObjectMapper()
                .setSerializationInclusion(JsonInclude.Include.NON_NULL);
            String serialized = mapper.writeValueAsString(o);
            return mask(serialized);
        } catch (JsonProcessingException e) {
            log.error("Error serializing object of type {}: {}", 
                o.getClass().getName(), e.getMessage());
            return String.valueOf(o);
        }
    }
}



public class UnifiedLogger {
    private static Logger log = LoggerFactory.getLogger(UnifiedLogger.class);
    
    /**
     * Helper method to mask any type of object
     */
    private static Object maskAny(Object obj) {
        if (obj == null) {
            return null;
        } else if (obj instanceof String) {
            return UnifiedLoggerUtil.mask((String) obj);
        } else {
            return UnifiedLoggerUtil.maskJson(obj);
        }
    }
    
    /**
     * Helper method to mask all objects in an array
     */
    private static Object[] maskAllArgs(Object[] args) {
        if (args == null) return null;
        
        Object[] maskedArgs = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            maskedArgs[i] = maskAny(args[i]);
        }
        return maskedArgs;
    }
    
    /**
     * Logs a debug message
     */
    public static void debug(String message) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        log.debug(maskedMessage);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage));
        }
    }
    
    /**
     * Logs a debug message with one argument
     */
    public static void debug(String message, Object arg1) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg = maskAny(arg1);
        
        log.debug(maskedMessage, maskedArg);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, new Object[] {maskedArg}));
        }
    }
    
    /**
     * Logs a debug message with two arguments
     */
    public static void debug(String message, Object arg1, Object arg2) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg1 = maskAny(arg1);
        Object maskedArg2 = maskAny(arg2);
        
        log.debug(maskedMessage, maskedArg1, maskedArg2);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, new Object[] {maskedArg1, maskedArg2}));
        }
    }
    
    /**
     * Logs a debug message with multiple arguments
     */
    public static void debug(String message, Object... args) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object[] maskedArgs = maskAllArgs(args);
        
        log.debug(maskedMessage, maskedArgs);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, maskedArgs));
        }
    }
    
    /**
     * Logs an info message
     */
    public static void info(String message) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        log.info(maskedMessage);
        if (LogProfile.isActive(InfoEvent.class)) {
            logEvent(new InfoEvent(maskedMessage));
        }
    }
    
    /**
     * Logs an info message with one argument
     */
    public static void info(String message, Object arg1) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg = maskAny(arg1);
        
        log.info(maskedMessage, maskedArg);
        if (LogProfile.isActive(InfoEvent.class)) {
            logEvent(new InfoEvent(maskedMessage, new Object[] {maskedArg}));
        }
    }
    
    /**
     * Logs an info message with two arguments
     */
    public static void info(String message, Object arg1, Object arg2) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg1 = maskAny(arg1);
        Object maskedArg2 = maskAny(arg2);
        
        log.info(maskedMessage, maskedArg1, maskedArg2);
        if (LogProfile.isActive(InfoEvent.class)) {
            logEvent(new InfoEvent(maskedMessage, new Object[] {maskedArg1, maskedArg2}));
        }
    }
    
    /**
     * Logs an info message with multiple arguments
     */
    public static void info(String message, Object... args) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object[] maskedArgs = maskAllArgs(args);
        
        log.info(maskedMessage, maskedArgs);
        if (LogProfile.isActive(InfoEvent.class)) {
            logEvent(new InfoEvent(maskedMessage, maskedArgs));
        }
    }
    
    /**
     * Logs an error message
     */
    public static void error(String message) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        log.error(maskedMessage);
        if (LogProfile.isActive(ErrorEvent.class)) {
            logEvent(new ErrorEvent(maskedMessage, null));
        }
    }
    
    /**
     * Logs an error message with multiple arguments
     */
    public static void error(String message, Object... args) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object[] maskedArgs = maskAllArgs(args);
        
        log.error(maskedMessage, maskedArgs);
        if (LogProfile.isActive(ErrorEvent.class)) {
            logEvent(new ErrorEvent(maskedMessage, null, maskedArgs));
        }
    }
    
    /**
     * Logs an error message with an exception
     */
    public static void error(String message, Throwable excp) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        String maskedStackTrace = UnifiedLoggerUtil.mask(CommonUtil.stackTrace(excp));
        
        log.error(maskedMessage + " Exception is: {} ", maskedStackTrace);
        if (LogProfile.isActive(ErrorEvent.class)) {
            logEvent(new ErrorEvent(maskedMessage, maskedStackTrace));
        }
    }
    
    /**
     * Logs an error message with an exception and multiple arguments
     */
    public static void error(String message, Throwable excp, Object... args) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        String maskedStackTrace = UnifiedLoggerUtil.mask(CommonUtil.stackTrace(excp));
        Object[] maskedArgs = maskAllArgs(args);
        
        Object[] allArgs = new Object[maskedArgs.length + 1];
        allArgs[0] = maskedStackTrace;
        System.arraycopy(maskedArgs, 0, allArgs, 1, maskedArgs.length);
        
        log.error("Exception is {} " + maskedMessage, allArgs);
        if (LogProfile.isActive(ErrorEvent.class)) {
            logEvent(new ErrorEvent(maskedMessage, maskedStackTrace, maskedArgs));
        }
    }
    
    // Keep other methods as they are...
}



==========================================


fullSSN=fullSSN
phoneNumber=phoneNumber
email=email
creditCardNumber=creditCardNumber
cvv=cvv
bankAccountNumber=bankAccountNumber
routingNumber=routingNumber
dateOfBirth=dateOfBirth
addressLine1=addressLine1
addressLine2=addressLine2
city=city
state=state
zip=zip
businessName=businessName
companyStructure=companyStructure
ipAddress=ipAddress
ipAddressV6=ipAddressV6

public class UnifiedLoggerUtil {
    private static final Set<String> SENSITIVE_FIELDS = loadSensitiveFields();
    private static final Logger log = LoggerFactory.getLogger(UnifiedLoggerUtil.class);
    private static final String MASK_REPLACEMENT = "******";
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    /**
     * Loads sensitive field names from the masking.properties file.
     *
     * @return a set of sensitive field names
     */
    public static Set<String> loadSensitiveFields() {
        Set<String> fields = new HashSet<>();
        Properties properties = new Properties();
        try (InputStream input =
                UnifiedLoggerUtil.class.getClassLoader().getResourceAsStream("masking.properties")) {
            if (input == null) {
                log.info("Sorry, unable to find masking.properties");
                return fields;
            }
            properties.load(input);

            properties.forEach((key, value) -> {
                fields.add(key.toString());
                System.out.println("Added sensitive field: " + key);
            });
        } catch (IOException ex) {
            log.error("Error loading masking.properties: {}", ex.getMessage(), ex);
        }
        return fields;
    }

    /**
     * Masks sensitive information in the given text by looking for field patterns.
     *
     * @param text the text to mask
     * @return the masked text
     */
    public static String mask(String text) {
        if (!StringUtils.hasLength(text)) {
            return text;
        }

        try {
            // If it's a potential JSON, try to mask it as JSON
            if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
                try {
                    return maskJson(objectMapper.readValue(text, Object.class));
                } catch (Exception e) {
                    // Not valid JSON, continue with string masking
                }
            }
            
            // Simple string masking for key-value patterns
            String maskedText = text;
            for (String field : SENSITIVE_FIELDS) {
                // Match patterns like "fieldName":"value" or "fieldName": "value" or fieldName=value
                String jsonPattern = "\"" + field + "\"\\s*:\\s*\"([^\"]+)\"";
                maskedText = maskedText.replaceAll(jsonPattern, "\"" + field + "\":\"" + MASK_REPLACEMENT + "\"");
                
                String jsonPattern2 = "\"" + field + "\"\\s*:\\s*([^,\\}\\s]+)";
                maskedText = maskedText.replaceAll(jsonPattern2, "\"" + field + "\":" + MASK_REPLACEMENT);
                
                String simplePattern = field + "\\s*=\\s*([^,;\\s]+)";
                maskedText = maskedText.replaceAll(simplePattern, field + "=" + MASK_REPLACEMENT);
            }
            return maskedText;
        } catch (Exception e) {
            log.error("Error occurred while masking text", e);
            throw new RuntimeException("Failed to mask text", e);
        }
    }

    /**
     * Recursively masks sensitive fields in a JSON object.
     *
     * @param value the object to mask
     * @return the masked object
     */
    @SuppressWarnings("unchecked")
    private static Object maskValueRecursively(Object value) {
        if (value == null) {
            return null;
        }
        
        if (value instanceof Map) {
            Map<String, Object> result = new HashMap<>();
            ((Map<String, Object>) value).forEach((k, v) -> {
                if (SENSITIVE_FIELDS.contains(k)) {
                    result.put(k, MASK_REPLACEMENT);
                } else {
                    result.put(k, maskValueRecursively(v));
                }
            });
            return result;
        } else if (value instanceof List) {
            List<Object> result = new ArrayList<>();
            ((List<Object>) value).forEach(item -> result.add(maskValueRecursively(item)));
            return result;
        } else if (value instanceof String || value instanceof Number || value instanceof Boolean) {
            return value;
        } else {
            // Convert custom objects to a map and mask recursively
            try {
                Map<String, Object> map = objectMapper.convertValue(value, Map.class);
                return maskValueRecursively(map);
            } catch (Exception e) {
                return value.toString();
            }
        }
    }

    /**
     * Masks sensitive information in the given JSON object.
     *
     * @param jsonObject the JSON object to mask
     * @return the masked JSON string
     */
    public static String maskJson(Object jsonObject) {
        try {
            if (jsonObject == null) {
                return null;
            }
            
            Object maskedObject = maskValueRecursively(jsonObject);
            return objectMapper.writeValueAsString(maskedObject);
        } catch (JsonProcessingException e) {
            log.error("Error serializing object to JSON", e);
            throw new RuntimeException("Failed to mask JSON", e);
        }
    }

    /**
     * Serializes object to JSON string with masking of sensitive fields.
     *
     * @param o the object to serialize
     * @return the masked JSON string
     */
    public static String serializeObjectToString(Object o) {
        if (o == null) {
            return null;
        }
        
        try {
            // First convert to JSON
            String json = objectMapper.writeValueAsString(o);
            // Then mask it
            return mask(json);
        } catch (JsonProcessingException e) {
            log.error("Error during serialization of object, of type:: {}, error:: {}", 
                    o.getClass().getName(), e.getMessage());
            return null;
        }
    }

    /**
     * Helper method to mask any type of object.
     *
     * @param obj the object to mask
     * @return the masked object or string
     */
    public static Object maskAny(Object obj) {
        if (obj == null) {
            return null;
        }
        
        if (obj instanceof String) {
            return mask((String) obj);
        } else {
            return maskJson(obj);
        }
    }
}




public class UnifiedLogger {
    private static Logger log = LoggerFactory.getLogger(UnifiedLogger.class);
    
    // Initialize code remains the same
    
    /**
     * Masks all arguments in an array.
     *
     * @param args array of arguments to mask
     * @return array of masked arguments
     */
    private static Object[] maskArguments(Object... args) {
        if (args == null) return null;
        
        return Arrays.stream(args)
            .map(arg -> UnifiedLoggerUtil.maskAny(arg))
            .toArray();
    }
    
    /**
     * Logs a debug message.
     *
     * @param message the message to log
     */
    public static void debug(String message) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        log.debug(maskedMessage);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage));
        }
    }
    
    /**
     * Logs a debug message with one argument.
     *
     * @param message the message to log
     * @param arg1 the argument to log
     */
    public static void debug(String message, Object arg1) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg = UnifiedLoggerUtil.maskAny(arg1);
        
        log.debug(maskedMessage, maskedArg);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, new Object[] {maskedArg}));
        }
    }
    
    /**
     * Logs a debug message with two arguments.
     *
     * @param message the message to log
     * @param arg1 the first argument to log
     * @param arg2 the second argument to log
     */
    public static void debug(String message, Object arg1, Object arg2) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object maskedArg1 = UnifiedLoggerUtil.maskAny(arg1);
        Object maskedArg2 = UnifiedLoggerUtil.maskAny(arg2);
        
        log.debug(maskedMessage, maskedArg1, maskedArg2);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, new Object[] {maskedArg1, maskedArg2}));
        }
    }
    
    /**
     * Logs a debug message with multiple arguments.
     *
     * @param message the message to log
     * @param args the arguments to log
     */
    public static void debug(String message, Object... args) {
        String maskedMessage = UnifiedLoggerUtil.mask(message);
        Object[] maskedArgs = maskArguments(args);
        
        log.debug(maskedMessage, maskedArgs);
        if (LogProfile.isActive(DebugEvent.class)) {
            logEvent(new DebugEvent(maskedMessage, maskedArgs));
        }
    }
