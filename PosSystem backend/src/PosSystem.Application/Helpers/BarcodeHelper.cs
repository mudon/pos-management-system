namespace PosSystem.Application.Helpers;

public static class BarcodeHelper
{
    public static bool IsValidBarcode(string barcode)
    {
        if (string.IsNullOrWhiteSpace(barcode))
            return false;

        // Basic validation: barcode should be between 8 and 32 characters
        // You can add more specific validation based on your barcode types
        return barcode.Length >= 8 && barcode.Length <= 32;
    }

    public static string NormalizeBarcode(string barcode)
    {
        return barcode.Trim().ToUpper();
    }
}