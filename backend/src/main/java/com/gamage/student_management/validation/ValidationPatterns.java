package com.gamage.student_management.validation;

public final class ValidationPatterns {

    public static final String PERSON_NAME = "^[\\p{L}\\p{M}]+(?:[ .'-][\\p{L}\\p{M}]+)*$";
    public static final String PERSON_NAME_MSG = "Can contain letters only (no numbers)";

    public static final String USERNAME = "^[a-zA-Z0-9._-]{3,50}$";
    public static final String USERNAME_MSG = "Username may contain letters, numbers, dots, hyphens, and underscores only";

    public static final String PHONE = "^$|^\\d{10}$";
    public static final String PHONE_MSG = "Phone number must be exactly 10 digits";

    public static final String COURSE_CODE = "^[A-Za-z0-9-]{2,20}$";
    public static final String COURSE_CODE_MSG = "Course code may contain letters, numbers, and hyphens only";

    private ValidationPatterns() {}
}
