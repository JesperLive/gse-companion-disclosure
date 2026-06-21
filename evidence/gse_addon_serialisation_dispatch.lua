-- Verbatim extract from the in-game GSE addon: Serialisation.lua lines 5-26
-- EncodeMessage / DecodeMessage: the plain !GSE3! format (C_EncodingUtil CBOR) and the dispatch that routes a !GSE3!+ string to the encrypted DecodePackedMessage path.
-- Source: World of Warcraft Retail, Interface/AddOns/GSE (build 3.3.22-12-gfb1946e-PatronBuild).
-- Reproduce: open the same file in any GSE install and read these lines.

-- This encodes a LUA Table for transmission
function GSE.EncodeMessage(tab)
        local result =
            "!GSE3!" .. C_EncodingUtil.EncodeBase64(C_EncodingUtil.CompressString(C_EncodingUtil.SerializeCBOR(tab)))
        return result
end

-- This decodes a string into a LUA Table.  This returns a bool (success) and an object that contains the results.
function GSE.DecodeMessage(data)
    if string.sub(data, 1, 7) == "!GSE3!+" then
        return pcall(GSE.DecodePackedMessage, data)
    elseif string.sub(data, 1, 6) == "!GSE3!" then
        return  pcall(function()
            local message = string.sub(data, 6, #data)
            local baseDecode = C_EncodingUtil.DecodeBase64(message)
            local decomString = C_EncodingUtil.DecompressString(baseDecode)
            return  C_EncodingUtil.DeserializeCBOR(decomString)
        end)
    else
        return false
    end
end
