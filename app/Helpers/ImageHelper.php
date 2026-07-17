<?php

declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

final class ImageHelper
{
    public static function store(string $folder, $file, string $appendText, $width = null, $height = null)
    {

        $path = $folder.'/'.Str::uuid().'-'.$appendText.'.'.$file->extension();
        $fullPath = storage_path('app/public/'.$path);

        $directory = dirname($fullPath);
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $manager = new ImageManager(new Driver);
        $image = $manager->read($file);

        if ($width && $height) {
            $image->resize($width, $height);
        }

        // Save image
        $image->save($fullPath);

        return Storage::url($path);
    }

    public static function deleteOld(string $path): void
    {
        // $path should be relative to storage/app/public
        $storagePath = storage_path('app/public/'.$path);
        if (is_file($storagePath)) {
            unlink($storagePath);
        }
    }
}
