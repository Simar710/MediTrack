allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // Add the Google services Gradle plugin
        classpath("com.google.gms:google-services:4.4.2")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.0") 
    }
}

val newBuildDir: Directory = rootProject.layout.buildDirectory.dir("../../build").get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}