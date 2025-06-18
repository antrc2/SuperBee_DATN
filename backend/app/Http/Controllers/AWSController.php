<?php

namespace App\Http\Controllers;

use Aws\Credentials\Credentials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Aws\S3\S3Client;
use Illuminate\Http\Response;
use Aws\Exception\AwsException;

class AWSController extends Controller
{
    // public function upload(Request $request)
    // {
    //     // Validate có file
    //     $request->validate([
    //         'file' => 'required|file|max:10240',
    //     ]);

    //     $file = $request->file('file');
    //     if (!$file->isValid()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'File upload không hợp lệ.',
    //         ], Response::HTTP_BAD_REQUEST);
    //     }

    //     // Lấy config AWS
    //     $accessKey = env("AWS_ACCESS_KEY_ID");
    //     $secretKey = env("AWS_SECRET_ACCESS_KEY");
    //     $bucketName = env("AWS_BUCKET");
    //     $region = env("AWS_DEFAULT_REGION", 'hn');
    //     $endpoint = env("AWS_S3_ENDPOINT", 'https://s3.cloudfly.vn');

    //     $credentials = new Credentials($accessKey, $secretKey);
    //     $s3Client = new S3Client([
    //         'version' => 'latest',
    //         'region' => $region,
    //         'signature_version' => 'v4',
    //         'credentials' => $credentials,
    //         'endpoint' => $endpoint,
    //         // 'use_path_style_endpoint' => true,
    //     ]);

    //     // Key theo /uploads/<tên file gốc>
    //     $originalName = $file->getClientOriginalName();
    //     $key = "uploads/{$originalName}";

    //     try {
    //         $result = $s3Client->putObject([
    //             'Bucket' => $bucketName,
    //             'Key' => $key,
    //             'ACL' => 'public-read',
    //             'SourceFile' => $file->getPathname(),
    //             'ContentType' => $file->getMimeType(),
    //         ]);
    //     } catch (AwsException $e) {
    //         Log::error('AWS S3 upload error: ' . $e->getMessage());
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi upload lên S3.',
    //             'error' => $e->getMessage(),
    //         ], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }

    //     // Lấy URL: dùng ObjectURL nếu có, nếu không tự build
    //     $url = $result['ObjectURL'] ?? null;
    //     if (!$url) {
    //         $trimmedEndpoint = rtrim($endpoint, '/');
    //         $url = "{$trimmedEndpoint}/{$bucketName}/{$key}";
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Upload thành công.',
    //         'data' => [
    //             'key' => $key,
    //             'url' => $url,
    //             'size' => $file->getSize(),
    //             'mime_type' => $file->getMimeType(),
    //         ],
    //     ], Response::HTTP_OK);
    // }
    // /**
    //  * Upload file(s) lên S3, luôn đặt prefix 'uploads/' cho key.
    //  *
    //  * Nếu request có file(s) (field 'file' hoặc 'file[]'), upload tất cả.
    //  * Nếu muốn upload file local, truyền param 'local_path' (string hoặc mảng) và tùy chọn 'object_name' (string hoặc mảng).
    //  *
    //  * Trả về JSON: nếu nhiều file, trả 'results' là mảng kết quả; nếu chỉ 1 file và dùng object_name string, vẫn nằm trong mảng để dễ xử lý phía client.
    //  */
    public function upload(Request $request)
    {
        // Đọc config từ env
        $bucket = env('AWS_BUCKET');
        $region = env('AWS_DEFAULT_REGION', 'ap-southeast-2');
        $accessKey = env('AWS_ACCESS_KEY_ID');
        $secretKey = env('AWS_SECRET_ACCESS_KEY');
        $customUrl = env('AWS_URL'); // endpoint tuỳ chỉnh, có thể null

        // Khởi tạo S3Client
        try {
            $s3Client = new S3Client([
                'version'     => 'latest',
                'region'      => $region,
                'credentials' => [
                    'key'    => $accessKey,
                    'secret' => $secretKey,
                ],
                // 'endpoint' => env('AWS_ENDPOINT'),
            ]);
        } catch (\Exception $e) {
            Log::error('Khởi tạo S3Client lỗi: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Không khởi tạo được S3 client',
                'message' => $e->getMessage(),
            ], 500);
        }

        // Kiểm tra bucket tồn tại/truy cập được
        try {
            $s3Client->headBucket(['Bucket' => $bucket]);
        } catch (AwsException $e) {
            Log::error('HeadBucket error: ' . $e->getMessage());
            $awsErr = method_exists($e, 'getAwsErrorMessage')
                ? $e->getAwsErrorMessage()
                : $e->getMessage();
            return response()->json([
                'error'   => 'Bucket không truy cập được',
                'message' => $awsErr,
            ], 500);
        }

        $uploads = []; // để chứa kết quả mỗi file

        // Xử lý upload file từ client
        if ($request->hasFile('file')) {
            $files = $request->file('file');
            // Nếu chỉ 1 file, Laravel trả UploadedFile, không phải mảng
            if (!is_array($files)) {
                $files = [$files];
            }
            // Lấy object_name; có thể là string hoặc mảng
            $rawNamesInput = $request->input('object_name');
            $useArrayNames = is_array($rawNamesInput);
            $countFiles = count($files);

            foreach ($files as $idx => $file) {
                if (! $file->isValid()) {
                    // Bỏ qua file không hợp lệ, ghi log và tiếp tục
                    Log::warning("File at index {$idx} không hợp lệ, bỏ qua.");
                    continue;
                }
                // Xác định rawObjectName
                if ($useArrayNames && isset($rawNamesInput[$idx]) && $rawNamesInput[$idx] !== '') {
                    $rawObjectName = $rawNamesInput[$idx];
                } elseif (!$useArrayNames && is_string($rawNamesInput) && $countFiles === 1) {
                    // chỉ dùng khi chỉ upload 1 file và object_name là string
                    $rawObjectName = $rawNamesInput;
                } else {
                    // fallback: dùng original name
                    $rawObjectName = $file->getClientOriginalName();
                }
                $source = $file->getPathname();
                $contentType = $file->getMimeType();

                // Thêm prefix 'uploads/'
                $trimmed = ltrim($rawObjectName, '/');
                $objectKey = 'uploads/' . $trimmed;

                // Upload
                try {
                    $params = [
                        'Bucket'     => $bucket,
                        'Key'        => $objectKey,
                        'SourceFile' => $source,
                    ];
                    if (!empty($contentType)) {
                        $params['ContentType'] = $contentType;
                    }
                    // Nếu cần public: 'ACL' => 'public-read'
                    $result = $s3Client->putObject($params);

                    // Xây URL
                    if ($customUrl) {
                        $fileUrl = rtrim($customUrl, '/') . '/' . ltrim($objectKey, '/');
                    } else {
                        $fileUrl = $result['ObjectURL'] ?? "https://{$bucket}.s3.{$region}.amazonaws.com/{$objectKey}";
                    }

                    Log::info("Upload thành công: {$fileUrl}");
                    $uploads[] = [
                        'bucket' => $bucket,
                        'key'    => $objectKey,
                        'url'    => $fileUrl,
                    ];
                } catch (AwsException $e) {
                    Log::error('Upload error: ' . $e->getMessage());
                    $awsErr = method_exists($e, 'getAwsErrorMessage')
                        ? $e->getAwsErrorMessage()
                        : $e->getMessage();
                    $uploads[] = [
                        'error'   => 'Upload thất bại',
                        'message' => $awsErr,
                        'file_index' => $idx,
                    ];
                } catch (\Exception $e) {
                    Log::error('Upload exception: ' . $e->getMessage());
                    $uploads[] = [
                        'error'   => 'Upload thất bại',
                        'message' => $e->getMessage(),
                        'file_index' => $idx,
                    ];
                }
            }

            return response()->json(['results' => $uploads]);
        }

        // Xử lý upload file local
        if ($request->filled('local_path')) {
            $localPaths = $request->input('local_path');
            // Nếu truyền single string, wrap thành mảng
            if (!is_array($localPaths)) {
                $localPaths = [$localPaths];
            }
            $rawNamesInput = $request->input('object_name');
            $useArrayNames = is_array($rawNamesInput);
            $countFiles = count($localPaths);

            foreach ($localPaths as $idx => $localPath) {
                if (!file_exists($localPath) || !is_file($localPath)) {
                    Log::warning("Local file không tồn tại hoặc không phải file: {$localPath}, bỏ qua.");
                    $uploads[] = [
                        'error' => "Local file không tồn tại hoặc không hợp lệ: {$localPath}",
                        'file_index' => $idx,
                    ];
                    continue;
                }
                // Xác định rawObjectName
                if ($useArrayNames && isset($rawNamesInput[$idx]) && $rawNamesInput[$idx] !== '') {
                    $rawObjectName = $rawNamesInput[$idx];
                } elseif (!$useArrayNames && is_string($rawNamesInput) && $countFiles === 1) {
                    $rawObjectName = $rawNamesInput;
                } else {
                    $rawObjectName = basename($localPath);
                }
                $source = $localPath;
                $contentType = mime_content_type($localPath) ?: null;

                // Thêm prefix 'uploads/'
                $trimmed = ltrim($rawObjectName, '/');
                $objectKey = 'uploads/' . $trimmed;

                // Upload
                try {
                    $params = [
                        'Bucket'     => $bucket,
                        'Key'        => $objectKey,
                        'SourceFile' => $source,
                    ];
                    if (!empty($contentType)) {
                        $params['ContentType'] = $contentType;
                    }
                    $result = $s3Client->putObject($params);

                    if ($customUrl) {
                        $fileUrl = rtrim($customUrl, '/') . '/' . ltrim($objectKey, '/');
                    } else {
                        $fileUrl = $result['ObjectURL'] ?? "https://{$bucket}.s3.{$region}.amazonaws.com/{$objectKey}";
                    }

                    Log::info("Upload local file thành công: {$fileUrl}");
                    $uploads[] = [
                        'bucket' => $bucket,
                        'key'    => $objectKey,
                        'url'    => $fileUrl,
                    ];
                } catch (AwsException $e) {
                    Log::error('UploadLocal error: ' . $e->getMessage());
                    $awsErr = method_exists($e, 'getAwsErrorMessage')
                        ? $e->getAwsErrorMessage()
                        : $e->getMessage();
                    $uploads[] = [
                        'error'   => 'Upload thất bại',
                        'message' => $awsErr,
                        'file_index' => $idx,
                    ];
                } catch (\Exception $e) {
                    Log::error('UploadLocal exception: ' . $e->getMessage());
                    $uploads[] = [
                        'error'   => 'Upload thất bại',
                        'message' => $e->getMessage(),
                        'file_index' => $idx,
                    ];
                }
            }

            return response()->json(['results' => $uploads]);
        }

        return response()->json([
            'error' => "Không có file để upload. Vui lòng gửi form-data field 'file' (có thể là file[] để nhiều) hoặc param 'local_path'."
        ], 400);
    }
}
