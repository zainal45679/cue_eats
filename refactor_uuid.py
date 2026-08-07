import os
import re

MIGRATIONS_DIR = 'database/migrations'
MODELS_DIR = 'app/Models'

def update_migrations():
    for filename in os.listdir(MIGRATIONS_DIR):
        if not filename.endswith('.php'):
            continue
        filepath = os.path.join(MIGRATIONS_DIR, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        # Replace $table->id(); with $table->uuid('id')->primary();
        content = re.sub(r'\$table->id\(\);', r"$table->uuid('id')->primary();", content)
        
        # Replace $table->foreignId(...) with $table->foreignUuid(...)
        content = re.sub(r'\$table->foreignId\(', r"$table->foreignUuid(", content)
        
        # Replace unsignedBigInteger('reference_id') with uuid('reference_id')
        content = re.sub(r"\$table->unsignedBigInteger\('reference_id'\)", r"$table->uuid('reference_id')", content)
        
        # Replace unsignedBigInteger('model_id') with uuid('model_id') for Spatie permissions etc
        # Actually Spatie permissions migration might be published. Wait, it is in database/migrations?
        
        # Replace morphs('...') with uuidMorphs('...')
        content = re.sub(r"\$table->morphs\(", r"$table->uuidMorphs(", content)
        content = re.sub(r"\$table->nullableMorphs\(", r"$table->nullableUuidMorphs(", content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated migration: {filename}")

def update_models():
    for root, dirs, files in os.walk(MODELS_DIR):
        for filename in files:
            if not filename.endswith('.php'):
                continue
            filepath = os.path.join(root, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Check if HasUuids is already imported
            if 'Illuminate\\Database\\Eloquent\\Concerns\\HasUuids' not in content:
                content = re.sub(
                    r'(namespace\s+App\\Models(?:\\.*?)?;)', 
                    r"\1\n\nuse Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;", 
                    content,
                    count=1
                )
            
            # Check if HasUuids trait is used
            if 'use HasUuids;' not in content and 'use HasFactory, HasUuids;' not in content:
                if 'use HasFactory;' in content:
                    content = re.sub(r'use HasFactory;', r'use HasFactory, HasUuids;', content)
                elif 'use HasRoles;' in content:
                    content = re.sub(r'use HasRoles;', r'use HasRoles, HasUuids;', content)
                else:
                    content = re.sub(r'(class\s+[^{]+\{)', r'\1\n    use HasUuids;', content, count=1)
                    
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated model: {filename}")

if __name__ == '__main__':
    print("Starting UUID refactor...")
    update_migrations()
    update_models()
    print("Done!")
